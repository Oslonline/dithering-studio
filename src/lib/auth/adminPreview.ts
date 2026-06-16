export const ADMIN_USER_PREVIEW_COOKIE = "ds_admin_user_preview";



export function readAdminUserPreviewCookie(value: string | undefined): boolean {

  return value === "1";

}


