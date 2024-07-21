import Image from "next/image";
import { FC } from "react";
import * as runtime from "react/jsx-runtime";

const useMDXComponent = (code: string) => {
  const fn = new Function(code);

  return fn({ ...runtime }).default;
};

const components = {
  Image,
};

type Props = {
  code: string;
};

export const MDXContent: FC<Props> = ({ code }) => {
  const Component = useMDXComponent(code);
  return <Component components={components} />;
};
