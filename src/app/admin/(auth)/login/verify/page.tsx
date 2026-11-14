import { Wizard } from "../../../_components/wizard";

export const metadata = { title: "Confirm sign-in" };

export default function VerifyLogin() {
  return <Wizard kind="login" />;
}
