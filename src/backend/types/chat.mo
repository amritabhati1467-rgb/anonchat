import Debug "mo:core/Debug";
import CommonTypes "common";

module {
  public type UserId = CommonTypes.UserId;
  public type Timestamp = CommonTypes.Timestamp;
  public type ConversationId = CommonTypes.ConversationId;
  public type MessageId = CommonTypes.MessageId;

  // A registered user with a permanent random numeric ID and optional nickname
  public type User = {
    id : UserId;
    var nickname : ?Text;
    createdAt : Timestamp;
  };

  // A single chat message
  public type Message = {
    id : MessageId;
    conversationId : ConversationId;
    senderId : UserId;
    text : Text;
    sentAt : Timestamp;
  };

  // A conversation between exactly two users
  public type Conversation = {
    id : ConversationId;
    participantA : UserId;
    participantB : UserId;
    var lastActivityAt : Timestamp;
  };

  // Public-facing (shared) snapshot of a User (no mutable fields)
  public type UserInfo = {
    id : UserId;
    nickname : ?Text;
    createdAt : Timestamp;
  };

  // Public-facing (shared) summary of a Conversation
  public type ConversationSummary = {
    id : ConversationId;
    otherUserId : UserId;
    otherUserNickname : ?Text;
    lastActivityAt : Timestamp;
  };
};
