import "bsm.sol";

contract Test is BSM {
  function test1() returns (bool) {
    return validateBSM(
      'Hello World',
      0x20a6a4cf2be3b58136c5a54e0614fd50342a1204,
      27,
      0x9e04c5756c7ae43976057db9af52bd7f343dd06e3f881ca2e12849c4bf73f567,
      0x482a007dcd848b88ba133f786db0e2205ae35ce452f557c6b04d1fcc0497b87a
    );
  }

  function test2() returns (bool) {
    return validateBSM(
      'Hello World Too',
      0x20a6a4cf2be3b58136c5a54e0614fd50342a1204,
      28,
      0x3e6de3b0544103489dd8d3c5be20d540353a17f1830b3646b5decbae4b8fbe6e,
      0x67f9236d0af4e9fc929f2105d05de5f2b1d737de5e6fbf67b1862f7fa18020f1
    );
  }
}
