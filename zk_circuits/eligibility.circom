pragma circom 2.0.0;

template AgeEligibility() {
    signal input age;
    signal output isEligible;

    // Age must be between 45 and 60 inclusive
    component minCheck = LessThan();
    component maxCheck = LessThan();

    minCheck.in[0] <== 44;
    minCheck.in[1] <== age;

    maxCheck.in[0] <== age;
    maxCheck.in[1] <== 61;

    isEligible <== minCheck.out * maxCheck.out;
}

component main = AgeEligibility();
