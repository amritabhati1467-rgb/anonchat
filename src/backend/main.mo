import Map "mo:core/Map";
import Types "types/chat";
import ChatApi "mixins/chat-api";

actor {
  // Stable state — no inline initializers; values come from the migration chain
  let users : Map.Map<Types.UserId, Types.User>;
  let tokenToUserId : Map.Map<Text, Types.UserId>;
  let conversations : Map.Map<Types.ConversationId, Types.Conversation>;
  let messages : Map.Map<Types.MessageId, Types.Message>;
  let counters : { var nextUserId : Nat; var nextConversationId : Nat; var nextMessageId : Nat };

  // Delegate all public functions to the chat API mixin
  include ChatApi(users, tokenToUserId, conversations, messages, counters);
};
