DO $$
DECLARE target record;
BEGIN
 FOR target IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target.tablename);
  EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated', target.tablename);
 END LOOP;
END $$;
--> statement-breakpoint
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;
--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;
--> statement-breakpoint
CREATE FUNCTION public.lock_new_application_tables() RETURNS event_trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE command record;
BEGIN
 FOR command IN SELECT * FROM pg_event_trigger_ddl_commands() LOOP
  IF command.command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO') AND command.schema_name = 'public' AND command.object_type = 'table' THEN
   EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', command.objid::regclass);
   EXECUTE format('REVOKE ALL ON TABLE %s FROM PUBLIC, anon, authenticated', command.objid::regclass);
  END IF;
 END LOOP;
END $$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.lock_new_application_tables() FROM PUBLIC, anon, authenticated;
--> statement-breakpoint
CREATE EVENT TRIGGER kimiya_lock_new_tables ON ddl_command_end WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO') EXECUTE FUNCTION public.lock_new_application_tables();
