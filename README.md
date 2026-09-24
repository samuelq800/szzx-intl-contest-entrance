# szzx-intl-contest-entrance
## Math Club AMC Assignments

The Math Club assignment feature uses the `mathclubmembers` profile role.

1. Run [`supabase/mathclub-assignments.sql`](./supabase/mathclub-assignments.sql) once in the Supabase SQL Editor.
2. In the entrance site's Admin Dashboard, set a registered student's role to `mathclubmembers`.
3. Use **布置 AMC 题目** to select AMC year, contest, form, and problem number, then publish the task.

Math Club members see **已布置 AMC 题目** after they sign in. The platform never exposes administrator credentials in the static website.

## Dashboard permissions

The dashboard's CSV export and management controls are available only to the admin account with user ID `b1b2e25b-3c5c-4a2d-be53-a48e1c7eced4`. Other admins can browse the dashboard without these controls. Apply [`supabase/data-manager-permissions.sql`](./supabase/data-manager-permissions.sql) to Supabase project `bwlcnaruyjazaxyiiumd` to enforce the assignment and profile management restrictions at the database layer. Applying this SQL to a different project will not change this site.

The dashboard currently loads readable records into each admin's browser. A browser user can copy or save data they are allowed to read, so the CSV control does not provide an absolute export ban. Preventing bulk extraction requires changing the data access model, such as a paginated server endpoint that limits the records sent to other admins.
