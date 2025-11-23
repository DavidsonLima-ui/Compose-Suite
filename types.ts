import { LucideIcon } from 'lucide-react';

export enum AppRoute {
  HUB = 'HUB',
  COMPOSE = 'COMPOSE',
  GRIDLY = 'GRIDLY',
  STAGE = 'STAGE',
  CLOUDBOX = 'CLOUDBOX',
  INBOX = 'INBOX'
}

export interface User {
  name: string;
  email?: string;
  avatar?: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'doc' | 'sheet' | 'slide' | 'folder';
  date: string;
  shared: boolean;
  color: string;
  content?: string;
}

export interface NavItem {
  id: AppRoute;
  label: string;
  icon: LucideIcon;
  color: string;
}

export enum TextGenStatus {
    IDLE = 'idle',
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error'
}