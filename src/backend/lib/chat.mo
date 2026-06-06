import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/chat";
import Order "mo:core/Order";

/// Domain logic for the anonymous chat application.
/// All functions are stateless helpers; state is passed in as parameters.
module {
  /// Generate the next sequential user ID from the counter record.
  public func nextUserId(state : { var nextUserId : Nat }) : Types.UserId {
    let id = state.nextUserId;
    state.nextUserId += 1;
    id;
  };

  /// Generate the next sequential conversation ID from the counter record.
  public func nextConversationId(state : { var nextConversationId : Nat }) : Types.ConversationId {
    let id = state.nextConversationId;
    state.nextConversationId += 1;
    id;
  };

  /// Generate the next sequential message ID from the counter record.
  public func nextMessageId(state : { var nextMessageId : Nat }) : Types.MessageId {
    let id = state.nextMessageId;
    state.nextMessageId += 1;
    id;
  };

  /// Find an existing conversation between two users, if any.
  public func findConversation(
    conversations : Map.Map<Types.ConversationId, Types.Conversation>,
    userA : Types.UserId,
    userB : Types.UserId,
  ) : ?Types.Conversation {
    for ((_, conv) in conversations.entries()) {
      if (
        (conv.participantA == userA and conv.participantB == userB) or
        (conv.participantA == userB and conv.participantB == userA)
      ) {
        return ?conv;
      };
    };
    null;
  };

  /// Return all conversations for a user sorted by most recent activity (descending).
  public func userConversations(
    conversations : Map.Map<Types.ConversationId, Types.Conversation>,
    userId : Types.UserId,
  ) : [Types.Conversation] {
    let matching = List.empty<Types.Conversation>();
    for ((_, conv) in conversations.entries()) {
      if (conv.participantA == userId or conv.participantB == userId) {
        matching.add(conv);
      };
    };
    // Sort by lastActivityAt descending
    matching.toArray().sort(
      func(a : Types.Conversation, b : Types.Conversation) : Order.Order {
        if (a.lastActivityAt > b.lastActivityAt) #less
        else if (a.lastActivityAt < b.lastActivityAt) #greater
        else #equal;
      }
    );
  };

  /// Return all messages for a conversation.
  public func getMessages(
    messages : Map.Map<Types.MessageId, Types.Message>,
    conversationId : Types.ConversationId,
  ) : [Types.Message] {
    let matching = List.empty<Types.Message>();
    for ((_, msg) in messages.entries()) {
      if (msg.conversationId == conversationId) {
        matching.add(msg);
      };
    };
    // Sort by sentAt ascending
    matching.toArray().sort(
      func(a : Types.Message, b : Types.Message) : Order.Order {
        if (a.sentAt < b.sentAt) #less
        else if (a.sentAt > b.sentAt) #greater
        else #equal;
      }
    );
  };

  /// Return messages for a conversation sent strictly after `since` timestamp.
  public func getMessagesSince(
    messages : Map.Map<Types.MessageId, Types.Message>,
    conversationId : Types.ConversationId,
    since : Types.Timestamp,
  ) : [Types.Message] {
    let matching = List.empty<Types.Message>();
    for ((_, msg) in messages.entries()) {
      if (msg.conversationId == conversationId and msg.sentAt > since) {
        matching.add(msg);
      };
    };
    // Sort by sentAt ascending
    matching.toArray().sort(
      func(a : Types.Message, b : Types.Message) : Order.Order {
        if (a.sentAt < b.sentAt) #less
        else if (a.sentAt > b.sentAt) #greater
        else #equal;
      }
    );
  };

  /// Convert an internal User record to the shared UserInfo type.
  public func toUserInfo(user : Types.User) : Types.UserInfo {
    { id = user.id; nickname = user.nickname; createdAt = user.createdAt };
  };

  /// Convert an internal Conversation to a ConversationSummary for the given viewer.
  public func toConversationSummary(
    conv : Types.Conversation,
    viewerId : Types.UserId,
    users : Map.Map<Types.UserId, Types.User>,
  ) : Types.ConversationSummary {
    let otherId = if (conv.participantA == viewerId) conv.participantB else conv.participantA;
    let otherNickname = switch (users.get(otherId)) {
      case (?u) u.nickname;
      case null null;
    };
    {
      id = conv.id;
      otherUserId = otherId;
      otherUserNickname = otherNickname;
      lastActivityAt = conv.lastActivityAt;
    };
  };
};
