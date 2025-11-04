type ProcessTask = {
  id: string;
  file: File;
  type: 'image' | 'video';
  onComplete: (result: { url: string; name: string; file: File }) => void;
  onError: (error: Error) => void;
};

class BackgroundProcessor {
  private queue: ProcessTask[] = [];
  private processing = false;
  private maxConcurrent = 3;
  private activeCount = 0;

  add(task: ProcessTask) {
    this.queue.push(task);
    this.process();
  }

  private async process() {
    if (this.processing || this.activeCount >= this.maxConcurrent) return;
    
    const task = this.queue.shift();
    if (!task) return;

    this.activeCount++;
    this.processing = true;

    try {
      if (task.type === 'image') {
        await this.processImage(task);
      } else {
        await this.processVideo(task);
      }
    } catch (error) {
      task.onError(error as Error);
    } finally {
      this.activeCount--;
      this.processing = false;
      if (this.queue.length > 0) {
        this.process();
      }
    }
  }

  private processImage(task: ProcessTask): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        task.onComplete({ url, name: task.file.name, file: task.file });
        resolve();
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(task.file);
    });
  }

  private processVideo(task: ProcessTask): Promise<void> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(task.file);
      task.onComplete({ url, name: task.file.name, file: task.file });
      resolve();
    });
  }

  clear() {
    this.queue = [];
  }

  getQueueSize() {
    return this.queue.length;
  }
}

export const backgroundProcessor = new BackgroundProcessor();
