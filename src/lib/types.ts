import { StringToBoolean } from "class-variance-authority/types";

export type ARTIST = {
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

export type PROJECT = {
  id: string;
  title: string;
  features: string[];
  githubLink: string;
  hostedLink: string;
  startDate: string;
  endDate: string;
  category: string;
  skills: string[];
}

export type WORK_EXPERIENCE = {
  id: number;
  title: string;
  company: string;
  href: string;
  duration: string;
  highlights: string[];
  skills: string[];
}

export type SOCIAL_LINKS = {
  name: string;
  url: string;
}

export type NAV_LINK = string[];
