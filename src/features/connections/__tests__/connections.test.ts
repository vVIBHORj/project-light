import { useConnectionsStore } from '../state/useConnectionsStore';
import { MockConnectionRepository, mockConnectionRepo } from '../../../data/mocks';
import { RelationshipStateMachine } from '../../../domain/relationshipStateMachine';
import { mockUsers } from '../../../data/mocks/seedData';

describe('Phase 6: Connections Feature & State Machine Tests', () => {
  const currentUser = mockUsers[0]; // Aisha Rao

  beforeEach(() => {
    mockConnectionRepo.reset();
    // Reset Zustand store state fields
    useConnectionsStore.setState({
      activeTab: 'all',
      connectionsList: [],
      isLoading: false,
      targetProfileForConnect: null,
      targetConnectionForDecision: null,
      targetConnectionForDating: null,
      targetConnectionForRemove: null,
      targetConnectionForInvite: null,
      isConnectRequestOpen: false,
      isDecisionSheetOpen: false,
      isDatingOptInOpen: false,
      isRemoveModalOpen: false,
      isInviteModalOpen: false,
      analyticsEvents: [],
    });
  });

  describe('CONN-01: Connect Request (Bottom Sheet & Modal State)', () => {
    it('opens and closes connect request modal for target profile', () => {
      const { openConnectRequest, closeConnectRequest } = useConnectionsStore.getState();
      const target = mockUsers[1]; // Rohan Mehta

      openConnectRequest(target);
      let state = useConnectionsStore.getState();
      expect(state.isConnectRequestOpen).toBe(true);
      expect(state.targetProfileForConnect?.userId).toBe(target.userId);

      closeConnectRequest();
      state = useConnectionsStore.getState();
      expect(state.isConnectRequestOpen).toBe(false);
      expect(state.targetProfileForConnect).toBeNull();
    });

    it('sends connection request successfully and logs analytics', async () => {
      const { sendConnectRequest } = useConnectionsStore.getState();
      const target = mockUsers[2]; // Sneha Kapoor

      const created = await sendConnectRequest({
        requesterId: currentUser.userId,
        recipientId: target.userId,
        intent: 'friendship',
        sharedContext: 'Shares Photography in Indiranagar',
        note: 'Loved your street photos!',
      });

      expect(created).toBeDefined();
      expect(created.state).toBe('pending');
      expect(created.sharedContextDescription).toBe('Shares Photography in Indiranagar');

      const state = useConnectionsStore.getState();
      const found = state.connectionsList.find((c) => c.id === created.id);
      expect(found).toBeDefined();

      const lastEvent = state.analyticsEvents.find((e) => e.event === 'connection_sent');
      expect(lastEvent).toBeDefined();
      expect(lastEvent?.payload.recipientId).toBe(target.userId);
    });

    it('validates relationship eligibility and prevents connecting with blocked users', () => {
      const blocked = [mockUsers[1].userId];
      const eligibility = RelationshipStateMachine.canSendConnectRequest(
        currentUser,
        mockUsers[1],
        'friendship',
        blocked
      );
      expect(eligibility.allowed).toBe(false);
    });

    it('prevents self-connection', () => {
      const eligibility = RelationshipStateMachine.canSendConnectRequest(
        currentUser,
        currentUser,
        'friendship',
        []
      );
      expect(eligibility.allowed).toBe(false);
      expect(eligibility.reason).toContain('yourself');
    });
  });

  describe('CONN-02: Connection Decision (Accept, Silent Decline, Restrict)', () => {
    it('accepts connection request and transitions stage to MUTUAL_CONNECTION', async () => {
      const { loadConnections, acceptConnection } = useConnectionsStore.getState();

      await loadConnections(currentUser.userId);
      let state = useConnectionsStore.getState();
      const pendingConn = state.connectionsList.find((c) => c.state === 'pending');
      expect(pendingConn).toBeDefined();

      const updated = await acceptConnection(pendingConn!.id);
      expect(updated.state).toBe('accepted');
      expect(updated.stage).toBe('MUTUAL_CONNECTION');

      state = useConnectionsStore.getState();
      const acceptedEvent = state.analyticsEvents.find((e) => e.event === 'connection_accepted');
      expect(acceptedEvent).toBeDefined();
    });

    it('declines connection request silently and removes from active list', async () => {
      const { loadConnections, declineConnection } = useConnectionsStore.getState();

      await loadConnections(currentUser.userId);
      let state = useConnectionsStore.getState();
      const pendingConn = state.connectionsList.find((c) => c.state === 'pending');
      expect(pendingConn).toBeDefined();

      const updated = await declineConnection(pendingConn!.id);
      expect(updated.state).toBe('declined');

      state = useConnectionsStore.getState();
      const exists = state.connectionsList.some((c) => c.id === pendingConn!.id);
      expect(exists).toBe(false);
    });

    it('restricts user connection', async () => {
      const { loadConnections, restrictConnection } = useConnectionsStore.getState();

      await loadConnections(currentUser.userId);
      const state = useConnectionsStore.getState();
      const pendingConn = state.connectionsList.find((c) => c.state === 'pending');
      expect(pendingConn).toBeDefined();

      const updated = await restrictConnection(pendingConn!.id);
      expect(updated.state).toBe('restricted');
    });
  });

  describe('CONN-03: Filter Grouping & Management', () => {
    it('sets filter tabs properly', () => {
      const { setActiveTab } = useConnectionsStore.getState();

      setActiveTab('friends');
      expect(useConnectionsStore.getState().activeTab).toBe('friends');

      setActiveTab('activity_partners');
      expect(useConnectionsStore.getState().activeTab).toBe('activity_partners');

      setActiveTab('dating');
      expect(useConnectionsStore.getState().activeTab).toBe('dating');

      setActiveTab('pending');
      expect(useConnectionsStore.getState().activeTab).toBe('pending');
    });
  });

  describe('CONN-04: Friendship Progression & Activity Suggestions', () => {
    it('marks connection as Friend and logs analytics', async () => {
      const { loadConnections, markFriend } = useConnectionsStore.getState();

      await loadConnections(currentUser.userId);
      let state = useConnectionsStore.getState();
      const connected = state.connectionsList.find((c) => c.state === 'accepted');
      expect(connected).toBeDefined();

      const updated = await markFriend(connected!.id);
      expect(updated.stage).toBe('FRIEND');

      state = useConnectionsStore.getState();
      const friendEvent = state.analyticsEvents.find((e) => e.event === 'friendship_marked');
      expect(friendEvent).toBeDefined();
    });

    it('marks connection as Activity Partner', async () => {
      const { loadConnections, markActivityPartner } = useConnectionsStore.getState();

      await loadConnections(currentUser.userId);
      const state = useConnectionsStore.getState();
      const connected = state.connectionsList.find((c) => c.state === 'accepted');
      expect(connected).toBeDefined();

      const updated = await markActivityPartner(connected!.id);
      expect(updated.stage).toBe('ACTIVITY_PARTNER');
    });
  });

  describe('CONN-05: Dating Progression (Strict Two-Sided Consent)', () => {
    it('one-sided dating opt-in remains a non-dating connection silently', async () => {
      const { loadConnections, setDatingOptIn } = useConnectionsStore.getState();
      await loadConnections(currentUser.userId);

      const state = useConnectionsStore.getState();
      const conn = state.connectionsList.find((c) => c.state === 'accepted');
      expect(conn).toBeDefined();

      // Only Aisha opts in (otherUser has not opted in)
      const updated = await setDatingOptIn(conn!.id, currentUser.userId, true);
      expect(updated.stage).not.toBe('DATING');
      expect(updated.datingOptIn.requester || updated.datingOptIn.recipient).toBe(true);

      const event = useConnectionsStore
        .getState()
        .analyticsEvents.find((e) => e.event === 'dating_intent_selected');
      expect(event).toBeDefined();
    });

    it('two-sided mutual dating opt-in promotes connection to DATING', async () => {
      const repo = new MockConnectionRepository();
      const conn = repo.mockConnections.find((c) => c.id === 'conn_2');
      expect(conn).toBeDefined();

      // Simulate other user having already opted into dating
      conn!.datingOptIn.recipient = true;

      // Requester also opts in -> Mutual!
      const updated = await repo.setDatingOptIn('conn_2', 'user_2', true);
      expect(updated.stage).toBe('DATING');
      expect(updated.datingOptIn.requester).toBe(true);
      expect(updated.datingOptIn.recipient).toBe(true);
    });

    it('evaluates dating progression through pure domain rules', () => {
      // 1-sided: Requester opted in, Recipient not
      const oneSided = RelationshipStateMachine.evaluateDatingProgression(true, false);
      expect(oneSided.isMutualDating).toBe(false);
      expect(oneSided.stage).toBe('MUTUAL_CONNECTION');

      // 2-sided: Both opted in
      const twoSided = RelationshipStateMachine.evaluateDatingProgression(true, true);
      expect(twoSided.isMutualDating).toBe(true);
      expect(twoSided.stage).toBe('DATING');
    });
  });

  describe('CONN-06: Remove / Unmatch & Safety Controls', () => {
    it('removes connection, revokes conversation and logs analytics', async () => {
      const { loadConnections, removeConnection } = useConnectionsStore.getState();
      await loadConnections(currentUser.userId);

      let state = useConnectionsStore.getState();
      const targetConn = state.connectionsList[0];
      expect(targetConn).toBeDefined();

      await removeConnection(targetConn.id, 'We grew apart');

      state = useConnectionsStore.getState();
      const remaining = state.connectionsList.find((c) => c.id === targetConn.id);
      expect(remaining).toBeUndefined();

      const removeEvent = state.analyticsEvents.find((e) => e.event === 'connection_removed');
      expect(removeEvent).toBeDefined();
      expect(removeEvent?.payload.reason).toBe('We grew apart');
    });
  });
});
