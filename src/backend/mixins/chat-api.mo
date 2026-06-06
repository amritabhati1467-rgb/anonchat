import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/chat";
import ChatLib "../lib/chat";

/// Public API mixin for the anonymous chat domain.
/// Receives all shared state slices via parameters.
/// Each caller passes their client-generated token (UUID/random hex stored in localStorage)
/// instead of relying on the IC caller principal — every anonymous browser shares the
/// same principal '2vxsx-fae', so token-based identity ensures uniqueness.
mixin (
  users : Map.Map<Types.UserId, Types.User>,
  tokenToUserId : Map.Map<Text, Types.UserId>,
  conversations : Map.Map<Types.ConversationId, Types.Conversation>,
  messages : Map.Map<Types.MessageId, Types.Message>,
  counters : {
    var nextUserId : Nat;
    var nextConversationId : Nat;
    var nextMessageId : Nat;
  },
) {
  /// Register a token as a new user (idempotent — returns existing ID if already registered).
  /// The token should be a UUID or random hex string generated and stored in the client's localStorage.
  /// Returns the permanent sequential numeric user ID.
  public func registerUser(token : Text) : async Types.UserId {
    switch (tokenToUserId.get(token)) {
      case (?existingId) existingId;
      case null {
        let id = ChatLib.nextUserId(counters);
        let now = Time.now();
        let user : Types.User = { id; var nickname = null; createdAt = now };
        users.add(id, user);
        tokenToUserId.add(token, id);
        id;
      };
    };
  };

  /// Return the UserInfo for the given token (must be registered first).
  public query func getMyProfile(token : Text) : async ?Types.UserInfo {
    switch (tokenToUserId.get(token)) {
      case null null;
      case (?uid) {
        switch (users.get(uid)) {
          case null null;
          case (?u) ?ChatLib.toUserInfo(u);
        };
      };
    };
  };

  /// Set or update the optional nickname for the user identified by token.
  public func setNickname(token : Text, nickname : ?Text) : async () {
    switch (tokenToUserId.get(token)) {
      case null {};
      case (?uid) {
        switch (users.get(uid)) {
          case null {};
          case (?u) u.nickname := nickname;
        };
      };
    };
  };

  /// Look up a user by their numeric ID (to initiate a conversation).
  public query func getUserById(userId : Types.UserId) : async ?Types.UserInfo {
    switch (users.get(userId)) {
      case null null;
      case (?u) ?ChatLib.toUserInfo(u);
    };
  };

  /// Start a new conversation with another user by their numeric ID.
  /// If a conversation already exists between the two users, returns the existing ID.
  public func startConversation(token : Text, otherUserId : Types.UserId) : async ?Types.ConversationId {
    switch (tokenToUserId.get(token)) {
      case null null;
      case (?callerId) {
        switch (users.get(otherUserId)) {
          case null null;
          case _ {
            switch (ChatLib.findConversation(conversations, callerId, otherUserId)) {
              case (?existing) ?existing.id;
              case null {
                let id = ChatLib.nextConversationId(counters);
                let conv : Types.Conversation = {
                  id;
                  participantA = callerId;
                  participantB = otherUserId;
                  var lastActivityAt = Time.now();
                };
                conversations.add(id, conv);
                ?id;
              };
            };
          };
        };
      };
    };
  };

  /// Return the list of conversations for the user identified by token, sorted by most recent activity.
  public query func listConversations(token : Text) : async [Types.ConversationSummary] {
    switch (tokenToUserId.get(token)) {
      case null [];
      case (?uid) {
        let convs = ChatLib.userConversations(conversations, uid);
        convs.map<Types.Conversation, Types.ConversationSummary>(
          func(c) { ChatLib.toConversationSummary(c, uid, users) }
        );
      };
    };
  };

  /// Send a message in a conversation.
  public func sendMessage(
    token : Text,
    conversationId : Types.ConversationId,
    text : Text,
  ) : async ?Types.MessageId {
    switch (tokenToUserId.get(token)) {
      case null null;
      case (?senderId) {
        switch (conversations.get(conversationId)) {
          case null null;
          case (?conv) {
            if (conv.participantA != senderId and conv.participantB != senderId) {
              return null;
            };
            let now = Time.now();
            let msgId = ChatLib.nextMessageId(counters);
            let msg : Types.Message = {
              id = msgId;
              conversationId;
              senderId;
              text;
              sentAt = now;
            };
            messages.add(msgId, msg);
            conv.lastActivityAt := now;
            ?msgId;
          };
        };
      };
    };
  };

  /// Return the full message history for a conversation.
  public query func getMessages(
    token : Text,
    conversationId : Types.ConversationId,
  ) : async [Types.Message] {
    switch (tokenToUserId.get(token)) {
      case null [];
      case (?uid) {
        switch (conversations.get(conversationId)) {
          case null [];
          case (?conv) {
            if (conv.participantA != uid and conv.participantB != uid) {
              return [];
            };
            ChatLib.getMessages(messages, conversationId);
          };
        };
      };
    };
  };

  /// Polling endpoint — return messages sent after the given timestamp.
  public query func getMessagesSince(
    token : Text,
    conversationId : Types.ConversationId,
    since : Types.Timestamp,
  ) : async [Types.Message] {
    switch (tokenToUserId.get(token)) {
      case null [];
      case (?uid) {
        switch (conversations.get(conversationId)) {
          case null [];
          case (?conv) {
            if (conv.participantA != uid and conv.participantB != uid) {
              return [];
            };
            ChatLib.getMessagesSince(messages, conversationId, since);
          };
        };
      };
    };
  };
};
