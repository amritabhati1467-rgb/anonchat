import Map "mo:core/Map";

module {
  // OldActor: empty — this is the first migration; on fresh install the
  // initial actor has no stable fields.
  type OldActor = {};

  // NewActor: full initial state with principalToUserId (Principal key).
  // The TokenIdentity migration that follows will rename it to tokenToUserId.
  type NewActor = {
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

  public func migration(_old : OldActor) : NewActor {
    {
      users = Map.empty<Nat, { id : Nat; var nickname : ?Text; createdAt : Int }>();
      principalToUserId = Map.empty<Principal, Nat>();
      conversations = Map.empty<Nat, { id : Nat; participantA : Nat; participantB : Nat; var lastActivityAt : Int }>();
      messages = Map.empty<Nat, { id : Nat; conversationId : Nat; senderId : Nat; text : Text; sentAt : Int }>();
      counters = { var nextUserId = 1; var nextConversationId = 1; var nextMessageId = 1 };
    };
  };
};
