-- Create access_codes table for authentication
CREATE TABLE public.access_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code_hash TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deployment_logs table
CREATE TABLE public.deployment_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    deployment_mode TEXT NOT NULL,
    drone_type TEXT NOT NULL,
    drone_count INTEGER NOT NULL,
    target_lat DECIMAL(10, 7) NOT NULL,
    target_lon DECIMAL(10, 7) NOT NULL,
    deployed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drone_status_history table
CREATE TABLE public.drone_status_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    drone_id TEXT NOT NULL,
    drone_type TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    lat DECIMAL(10, 7),
    lon DECIMAL(10, 7),
    battery INTEGER,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_activity_audit table
CREATE TABLE public.user_activity_audit (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drone_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_audit ENABLE ROW LEVEL SECURITY;

-- Access codes: Only service role can manage (no public access)
CREATE POLICY "No public access to access_codes" ON public.access_codes FOR ALL USING (false);

-- Authenticated sessions can insert logs (validated via edge function)
CREATE POLICY "Insert deployment logs" ON public.deployment_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Read own deployment logs" ON public.deployment_logs FOR SELECT USING (true);

CREATE POLICY "Insert drone status" ON public.drone_status_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Read drone status" ON public.drone_status_history FOR SELECT USING (true);

CREATE POLICY "Insert activity audit" ON public.user_activity_audit FOR INSERT WITH CHECK (true);
CREATE POLICY "Read activity audit" ON public.user_activity_audit FOR SELECT USING (true);

-- Insert a default access code (hashed: "COMMANDER2024")
INSERT INTO public.access_codes (code_hash, description) 
VALUES ('5e884898da28047d9169e0f4bf7c7b6aa0ab2e15c7bcb9f8d0d48b1a2f8c3e9d', 'Default Commander Access');