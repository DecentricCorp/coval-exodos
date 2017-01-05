contract BSM {
  // Notes:
  // - this is limited to a payload length of 253 bytes
  // - the payload should be ASCII as many clients will want to display this to the user
  function createBSMHash(string payload) returns (bytes32) {
    // \x18Bitcoin Signed Message:\n#{message.size.chr}#{message}
    string memory prefix = "\x18Bitcoin Signed Message:\n";
    return sha256(sha256(prefix, bytes1(bytes(payload).length), payload));
  }

  function validateBSM(string payload, address key, uint8 v, bytes32 r, bytes32 s) returns (bool) {
    return key == ecrecover(createBSMHash(payload), v, r, s);
  }
}
