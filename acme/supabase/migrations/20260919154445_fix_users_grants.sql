SET local check_function_bodies = off;

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "authenticated";

REVOKE ALL ON FUNCTION "public"."update_updated_at_column"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."update_updated_at_column"() FROM "authenticated";

REVOKE ALL ON TABLE "public"."users" FROM "anon";

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;

REVOKE ALL ON FUNCTION "public"."update_updated_at_column"() FROM PUBLIC;

REVOKE ALL ON TABLE "public"."users" FROM "authenticated";

GRANT SELECT, UPDATE ON TABLE "public"."users" TO "authenticated";
