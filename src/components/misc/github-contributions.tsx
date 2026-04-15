"use client";

import dynamic from "next/dynamic";

const GitHubCalendar = dynamic(
  () =>
    import("react-github-calendar").then((mod) => mod.GitHubCalendar),
  { ssr: false }
);

export const GithubContributions = () => {
  return (
    <div className="w-full overflow-x-auto" >
      <GitHubCalendar
        username="MaarcusRenieroL"
        blockSize={12}
        blockMargin={4}
        fontSize={14}
        theme={{
          dark: [
            "#161616",
            "#2a2a2a",
            "#3a3a3a",
            "#5a5a5a",
            "#8a8a8a",
          ],
        }}
      />
    </div>
  );
};
