DROP POLICY "Anon cannot select users" ON "public"."users";

DROP POLICY "Authenticated can select own users" ON "public"."users";

CREATE POLICY "Anon can select users" ON "public"."users"
  FOR SELECT
  TO "anon"
  USING ((deleted_at IS NULL));

CREATE POLICY "Authenticated can select users" ON "public"."users"
  FOR SELECT
  TO "authenticated"
  USING ((deleted_at IS NULL));

REVOKE ALL ON TABLE "public"."users" FROM "anon";

GRANT SELECT ON TABLE "public"."users" TO "anon";
