// src/types/feedback.ts
export interface ImageAttachment {
  name: string;
  owner: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  image: string;
  remarks?: string;
  parent: string;
  parentfield: string;
  parenttype: string;
  doctype: string;
}

export interface FeedbackItem {
  name: string;
  creation: string;
  modified: string;
  modified_by: string;
  owner: string;
  docstatus: number;
  idx: number;
  naming_series: string;
  subject: string;
  customer: string | null;
  raised_by: string;
  status: string;
  priority: string;
  issue_type: string;
  issue_split_from: string | null;
  description: string;
  service_level_agreement: string | null;
  response_by: string | null;
  agreement_status: string;
  sla_resolution_by: string | null;
  service_level_agreement_creation: string | null;
  on_hold_since: string | null;
  total_hold_time: number | null;
  first_response_time: number | null;
  first_responded_on: string | null;
  avg_response_time: number | null;
  resolution_details: string | null;
  opening_date: string;
  opening_time: string;
  sla_resolution_date: string | null;
  resolution_time: number | null;
  user_resolution_time: number | null;
  lead: string | null;
  contact: string | null;
  email_account: string | null;
  customer_name: string | null;
  project: string | null;
  company: string | null;
  via_customer_portal: number;
  attachment: string | null;
  content_type: string | null;
  _user_tags: string | null;
  _comments: string | null;
  _assign: string | null;
  _liked_by: string | null;
  _seen: string | null;
  custom_module: string | null;
  doctype: string;
  custom_images: ImageAttachment[];
}