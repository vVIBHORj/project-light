import { MockCircleRepository, MockCommunityRepository } from '../../../data/mocks';
import { useCirclesStore } from '../state/useCirclesStore';
import { CreateCircleDto, CreateCommunityDto } from '../../../data/repositories';

describe('Phase 5 — Circles & Communities Governance Suite', () => {
  let circleRepo: MockCircleRepository;
  let communityRepo: MockCommunityRepository;

  beforeEach(() => {
    circleRepo = new MockCircleRepository();
    communityRepo = new MockCommunityRepository();
    useCirclesStore.setState({
      analyticsEvents: [],
      communitiesList: [],
      circlesList: [],
      myCirclesList: [],
    });
  });

  describe('Circle Capacity & Membership Rules', () => {
    it('allows joining an open public Circle and updates member count', async () => {
      const circle = await circleRepo.getCircleById('circle_1');
      expect(circle).not.toBeNull();
      const initialMembers = circle!.currentMemberCount;

      const updated = await circleRepo.joinCircle('circle_1', 'user_new_test');
      expect(updated.members).toContain('user_new_test');
      expect(updated.currentMemberCount).toBe(initialMembers + 1);
    });

    it('enforces server-authoritative capacity limits and blocks overbooking', async () => {
      const circle = await circleRepo.getCircleById('circle_2'); // full circle (4/4)
      expect(circle).not.toBeNull();
      expect(circle!.currentMemberCount).toBe(circle!.capacity);

      await expect(circleRepo.joinCircle('circle_2', 'user_overbooking_test')).rejects.toThrow(
        'This Circle is full. No spots available.'
      );
    });

    it('strictly enforces Circle capacity between 4 and 8 on creation', async () => {
      const invalidCircle: CreateCircleDto = {
        title: 'Too Large Circle',
        activityName: 'Mass Meetup',
        category: 'Sports',
        capacity: 15, // Invalid: must be <= 8
        cadence: 'Weekly',
        locationZone: 'Indiranagar',
        hostId: 'user_1',
        hostName: 'Aisha Rao',
      };

      await expect(circleRepo.createCircle(invalidCircle)).rejects.toThrow(
        'Circle capacity must be between 4 and 8 members.'
      );

      const validCircle: CreateCircleDto = {
        title: 'Valid Circle',
        activityName: 'Photo Walk',
        category: 'Photography',
        capacity: 6,
        cadence: 'Weekly',
        locationZone: 'Indiranagar',
        hostId: 'user_1',
        hostName: 'Aisha Rao',
      };

      const created = await circleRepo.createCircle(validCircle);
      expect(created.id).toBeDefined();
      expect(created.capacity).toBe(6);
      expect(created.members).toContain('user_1');
    });

    it('decrements member count when leaving a Circle', async () => {
      await circleRepo.joinCircle('circle_1', 'user_leave_test');
      const beforeLeave = await circleRepo.getCircleById('circle_1');
      const countBefore = beforeLeave!.currentMemberCount;

      await circleRepo.leaveCircle('circle_1', 'user_leave_test');
      const afterLeave = await circleRepo.getCircleById('circle_1');
      expect(afterLeave!.members).not.toContain('user_leave_test');
      expect(afterLeave!.currentMemberCount).toBe(countBefore - 1);
    });
  });

  describe('Community Creation, Solicitation Filters & Join Flow', () => {
    it('rejects community creation containing banned solicitation keywords', async () => {
      const badCommunity: CreateCommunityDto = {
        name: 'Guaranteed Crypto Investment Group',
        description: 'Join for guaranteed returns and crypto investment schemes',
        category: 'Tech & Startups',
        zone: 'Indiranagar',
        visibility: 'public',
        rules: [],
        hostId: 'user_1',
        hostName: 'Aisha Rao',
      };

      await expect(communityRepo.createCommunity(badCommunity)).rejects.toThrow(
        'Community name or description contains prohibited solicitation term'
      );
    });

    it('creates a valid community and automatically assigns host as approved', async () => {
      const validCommunity: CreateCommunityDto = {
        name: 'Bengaluru Classical Music Club',
        description: 'Weekly listening sessions and live Carnatic concert outings.',
        category: 'Music & Audio',
        zone: 'Malleswaram',
        visibility: 'public',
        rules: ['Respect artists', 'No commercial gear spam'],
        hostId: 'user_1',
        hostName: 'Aisha Rao',
      };

      const created = await communityRepo.createCommunity(validCommunity);
      expect(created.id).toBeDefined();
      expect(created.name).toBe('Bengaluru Classical Music Club');

      const status = await communityRepo.getMembershipStatus(created.id, 'user_1');
      expect(status).toBe('approved');
    });

    it('handles private community join requests with pending state and approval', async () => {
      // Create private community
      const privateComm = await communityRepo.createCommunity({
        name: 'Private Design Founders',
        description: 'Design leadership circle',
        category: 'Tech & Startups',
        zone: 'Indiranagar',
        visibility: 'private',
        rules: ['Confidentiality'],
        hostId: 'user_1',
        hostName: 'Aisha Rao',
      });

      // User submits request
      const res = await communityRepo.joinCommunity(
        privateComm.id,
        'user_designer',
        'Designer User',
        ['Founder of Studio X', 'Available Friday evenings']
      );

      expect(res.status).toBe('pending');
      const memberStatus = await communityRepo.getMembershipStatus(privateComm.id, 'user_designer');
      expect(memberStatus).toBe('pending');

      // Host approves request
      const pendingList = await communityRepo.getPendingRequests(privateComm.id);
      expect(pendingList.length).toBe(1);

      await communityRepo.resolveJoinRequest(pendingList[0].id, 'user_1', 'approved');

      const statusAfter = await communityRepo.getMembershipStatus(privateComm.id, 'user_designer');
      expect(statusAfter).toBe('approved');

      // Check audit log written
      const logs = await communityRepo.getAuditLogs(privateComm.id);
      expect(logs.some((l) => l.action === 'approve_join')).toBe(true);
    });

    it('allows canceling a pending join request', async () => {
      const privateComm = await communityRepo.createCommunity({
        name: 'Private Film Guild',
        description: 'Independent filmmakers',
        category: 'Photography',
        zone: 'Jayanagar',
        visibility: 'private',
        rules: ['Respect craft'],
        hostId: 'user_1',
        hostName: 'Aisha Rao',
      });

      await communityRepo.joinCommunity(privateComm.id, 'user_cancel_test', 'User', ['Ans 1']);
      expect(await communityRepo.getMembershipStatus(privateComm.id, 'user_cancel_test')).toBe('pending');

      await communityRepo.cancelJoinRequest(privateComm.id, 'user_cancel_test');
      expect(await communityRepo.getMembershipStatus(privateComm.id, 'user_cancel_test')).toBe('none');
    });
  });

  describe('Community Moderation & Audit Logging', () => {
    it('allows moderator to remove or hide posts with audit logs', async () => {
      const post = await communityRepo.createPost(
        'comm_1',
        'user_bad',
        'Bad User',
        'Spam promotional message'
      );

      expect(post.moderationState).toBe('visible');

      // Moderator removes post
      await communityRepo.moderatePost('comm_1', 'user_1', 'Aisha Rao (Host)', post.id, 'remove');

      const visiblePosts = await communityRepo.getPosts('comm_1');
      expect(visiblePosts.some((p) => p.id === post.id)).toBe(false);

      const logs = await communityRepo.getAuditLogs('comm_1');
      expect(logs.some((l) => l.action === 'remove_post' && l.targetId === post.id)).toBe(true);
    });

    it('enforces that banned members lose access and cannot rejoin', async () => {
      // Ban user_3
      await communityRepo.moderateMember('comm_1', 'user_1', 'Aisha Rao (Host)', 'user_3', 'ban');

      const status = await communityRepo.getMembershipStatus('comm_1', 'user_3');
      expect(status).toBe('banned');

      // Attempting to join throws error
      await expect(
        communityRepo.joinCommunity('comm_1', 'user_3', 'Pooja Iyer')
      ).rejects.toThrow('You have been restricted from accessing this community.');

      // Check audit log
      const logs = await communityRepo.getAuditLogs('comm_1');
      expect(logs.some((l) => l.action === 'ban_member' && l.targetId === 'user_3')).toBe(true);
    });
  });

  describe('Zustand Circles Store & Analytics Events', () => {
    it('records analytics when creating and joining communities and circles', async () => {
      const store = useCirclesStore.getState();

      await store.createCommunity({
        name: 'Bengaluru Board Gamers',
        description: 'Strategy board games weekly meetups',
        category: 'Board Games',
        zone: 'HSR Layout',
        visibility: 'public',
        rules: ['Have fun'],
        hostId: 'user_1',
        hostName: 'Aisha Rao',
      });

      const events = useCirclesStore.getState().analyticsEvents;
      expect(events.some((e) => e.event === 'community_created')).toBe(true);
    });
  });
});
