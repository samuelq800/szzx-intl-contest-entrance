# szzx-intl-contest-entrance
## Math Club AMC Assignments

The Math Club assignment feature uses the `mathclubmembers` profile role.

1. Run [`supabase/mathclub-assignments.sql`](./supabase/mathclub-assignments.sql) once in the Supabase SQL Editor.
2. In the entrance site's Admin Dashboard, set a registered student's role to `mathclubmembers`.
3. Use **布置 AMC 题目** to select AMC year, contest, form, and problem number, then publish the task.

Math Club members see **已布置 AMC 题目** after they sign in. The platform never exposes administrator credentials in the static website.
