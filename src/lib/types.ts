export type Artist = {
  spotify: string;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export type SPOTIFY_DATA = {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
  progress: number;
  duration: number;
}

export type SPOTIFY_ERROR = {
  isPlaying: boolean;
}

export type DISCORD_ACTIVITY = {
  id: string;
  name: string;
  state: string;
  details: string;
  assets: {
    large_image: string;
    large_text: string;
    small_image: string;
    small_text: string;
  }
}

export type Project = {
  id: string;
  title: string;
  features: string[];
  githubLink: string;
  hostedLink: string;
  startDate: string;
  endDate: string | null;
  isOngoing: boolean;
  category: CATEGORY;
  skills: string[];
}

export type WorkExperience = {
  id: number;
  title: string;
  company: string;
  href: string;
  duration: string;
  highlights: string[];
  skills: string[];
}

export type SocialLink = {
  name: string;
  url: string;
}

export type NavLink = string[];

export type CATEGORY = "full stack" | "front end" | "miscellaneous" | "freelance";
