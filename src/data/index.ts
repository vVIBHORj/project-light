import { mockRepositories } from './mocks';
import {
  AuthRepository,
  ProfileRepository,
  CircleRepository,
  CommunityRepository,
  ConnectionRepository,
  MessageRepository,
  EventRepository,
  SafetyRepository,
} from './repositories';

export * from './repositories';
export * from './mocks/seedData';

// Dependency injection container for data access
export interface Repositories {
  auth: AuthRepository;
  profile: ProfileRepository;
  circle: CircleRepository;
  community: CommunityRepository;
  connection: ConnectionRepository;
  message: MessageRepository;
  event: EventRepository;
  safety: SafetyRepository;
}

export const repositories: Repositories = mockRepositories;

export default repositories;
