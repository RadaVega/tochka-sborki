# Yandex Metrika goals (Counter 109303611)

## Goals to create (type: JavaScript event)
- `hermes_launch` — click on "ЗАПУСТИТЬ HERMES" on `/hermes`.
- `student_register_success` — successful `POST /api/students`.
- `project_submit_success` — successful `POST /api/submit-project`.
- `contact_send_success` — successful `POST /api/contact`.
- `subscribe_success` — successful `POST /api/subscribe`.
- `demo_view` — open `/demo` route.
- `investor_cta_click` — click on "Связаться" / "Инвестировать" CTA.

## Auto-goal attributes in forms
- `data-ym-goal="student_register"`
- `data-ym-goal="project_submit"`
- `data-ym-goal="contact_send"`
- `data-ym-goal="subscribe"`

## How to validate
1. Open site URL with `?_ym_debug=1`, e.g. `https://tochkasborki-vortexvoyager21.amvera.io/hermes?_ym_debug=1`.
2. Open browser console/network and trigger actions.
3. Verify lines like `reachGoal` and events in Metrika debugger.
4. In Metrika UI: Цели → type "JavaScript-событие" and identifier exactly as above.
