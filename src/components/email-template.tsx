import { FC } from "react";

interface Props {
  firstName: string;
}

export const EmailTemplate: FC<Readonly<Props>> = ({ firstName }) => (
  <div>
    <h1>Welcome, {firstName}!</h1>
  </div>
);
