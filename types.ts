
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  isGuest: boolean;
  isAdmin?: boolean;
  isBanned?: boolean;
  joinedForumIds: string[];
  createdForumIds: string[];
  friendsCount: number;
  postStreak: number;
  friendIds: string[];
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  toId: string;
  status: 'pending' | 'accepted';
  timestamp: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

export interface Forum {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  icon: string;
  creatorId: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  forumId: string;
  forumName: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  comments: number;
}

export interface NexusNotification {
  id: string;
  type: 'post' | 'friend_request';
  forumName?: string;
  forumId?: string;
  authorName: string;
  timestamp: string;
  read: boolean;
}

export type View = 'feed' | 'forum' | 'profile' | 'settings' | 'search' | 'friends';
