import service from "@/utils/request";

export const getNotifications = (params) => {
  return service.get("/notification/", { params });
};

export const markNotificationRead = (id) => {
  return service.post(`/notification/${id}/mark_read/`);
};

export const markAllNotificationsRead = () => {
  return service.post("/notification/mark_all_read/");
};

export const getUnreadCount = () => {
  return service.get("/notification/unread_count/");
};

export const sendEmailVerification = (data) => {
  return service.post("/notification/send_email_verification/", data);
};

export const verifyEmail = (data) => {
  return service.get("/notification/verify_email/", { params: data });
};

export const isEmailVerificationRequired = () => {
  return service.get("/notification/is_email_verification_required/");
};

export const getEmailConfig = () => {
  return service.get("/notification/email_config/");
};
