import { type IconType } from "react-icons";
import {
  FaGithub, FaInstagram, FaYoutube, FaXTwitter, FaFacebookF,
  FaLinkedinIn, FaTwitch, FaTelegram, FaVk, FaTiktok, FaDiscord,
  FaSpotify, FaSoundcloud, FaSnapchat, FaWhatsapp, FaPinterestP,
  FaRedditAlien, FaSteam, FaApple, FaAmazon, FaDribbble, FaBehance,
  FaPatreon, FaMedium, FaStackOverflow, FaFigma, FaThreads,
} from "react-icons/fa6";
import {
  SiNotion, SiSubstack,
} from "react-icons/si";
import {
  HiOutlineGlobeAlt, HiOutlineMail, HiOutlinePhone,
} from "react-icons/hi";

const DOMAIN_ICON_MAP: [RegExp, IconType][] = [
  [/github\.com/, FaGithub],
  [/instagram\.com/, FaInstagram],
  [/youtube\.com|youtu\.be/, FaYoutube],
  [/twitter\.com|x\.com/, FaXTwitter],
  [/threads\.net/, FaThreads],
  [/facebook\.com|fb\.com/, FaFacebookF],
  [/linkedin\.com/, FaLinkedinIn],
  [/twitch\.tv/, FaTwitch],
  [/t\.me|telegram\.org/, FaTelegram],
  [/vk\.com|vkontakte\.ru/, FaVk],
  [/tiktok\.com/, FaTiktok],
  [/discord\.gg|discord\.com/, FaDiscord],
  [/spotify\.com/, FaSpotify],
  [/soundcloud\.com/, FaSoundcloud],
  [/snapchat\.com/, FaSnapchat],
  [/wa\.me|whatsapp\.com/, FaWhatsapp],
  [/pinterest\.com|pin\.it/, FaPinterestP],
  [/reddit\.com/, FaRedditAlien],
  [/steam(community|powered)?\.com/, FaSteam],
  [/music\.apple\.com|apps\.apple\.com/, FaApple],
  [/amazon\.com/, FaAmazon],
  [/dribbble\.com/, FaDribbble],
  [/behance\.net/, FaBehance],
  [/patreon\.com/, FaPatreon],
  [/medium\.com/, FaMedium],
  [/stackoverflow\.com/, FaStackOverflow],
  [/figma\.com/, FaFigma],
  [/notion\.so|notion\.site/, SiNotion],
  [/substack\.com/, SiSubstack],
  [/mailto:/, HiOutlineMail],
  [/tel:/, HiOutlinePhone],
];

export function getSocialIcon(url: string): IconType {
  const lower = url.toLowerCase();
  for (const [pattern, icon] of DOMAIN_ICON_MAP) {
    if (pattern.test(lower)) return icon;
  }
  return HiOutlineGlobeAlt;
}
