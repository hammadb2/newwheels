-- Add Retell AI call recording columns to leads table.
-- retell_recording_url: URL of the call recording from Retell
-- retell_call_duration_seconds: duration of the Retell qualification call

alter table nw.leads
  add column if not exists retell_recording_url text,
  add column if not exists retell_call_duration_seconds integer;

comment on column nw.leads.retell_recording_url is 'URL of the Retell AI call recording for playback in CRM';
comment on column nw.leads.retell_call_duration_seconds is 'Duration of the Retell AI qualification call in seconds';
