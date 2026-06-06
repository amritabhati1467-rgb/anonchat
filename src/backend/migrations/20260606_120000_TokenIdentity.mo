import Map "mo:core/Map";

module {
  // OldActor: state after Init migration (still has principalToUserId with Principal key)
  type OldActor = {
    users : Map.Map<Nat, {
      id : Nat;
      var nickname : ?Text;
      createdAt : Int;
    }>;
    principalToUserId : Map.Map<Principal, Nat>;
    conversations : Map.Map<Nat, {
      id : Nat;
      participantA : Nat;
      participantB : Nat;
      var lastActivityAt : Int;
    }>;
    messages : Map.Map<Nat, {
      id : Nat;
      conversationId : Nat;
      senderId : Nat;
      text : Text;
      sentAt : Int;
    }>;
    counters : {
      var nextUserId : Nat;
      var nextConversationId : Nat;
      var nextMessageId : Nat;
    };
  };

  // NewActor: renames principalToUserId -> tokenToUserId (Text key)
  type NewActor = {
    users : Map.Map<Nat, {
      id : Nat;
      var nickname : ?Text;
      createdAt : Int;
    }>;
    tokenToUserId : Map.Map<Text, Nat>;
    conversations : Map.Map<Nat, {
      id : Nat;
      participantA : Nat;
      participantB : Nat;
      var lastActivityAt : Int;
    }>;
    messages : Map.Map<Nat, {
      id : Nat;
      conversationId : Nat;
      senderId : Nat;
      text : Text;
      sentAt : Int;
    }>;
    counters : {
      var nextUserId : Nat;
      var nextConversationId : Nat;
      var nextMessageId : Nat;
    };
  };

  // Migrate: principalToUserId -> tokenToUserId starts empty because
  // old keys were Principal (the shared anonymous principal '2vxsx-fae')
  // and cannot be converted to UUID Text tokens. Fresh start is correct.
  public func migration(old : OldActor) : NewActor {
    {
      users = old.users;
      tokenToUserId = Map.empty<Text, Nat>();
      conversations = old.conversations;
      messages = old.messages;
      counters = old.counters;
    };
  };
};
