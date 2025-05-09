pragma circom 2.0.0;

template MeanGreaterThanThreshold(n, threshold) {
    signal input values[n];
    signal output out;

    var sum = 0;
    for (var i = 0; i < n; i++) {
        sum += values[i];
    }
    var mean = sum / n;

    out <== mean > threshold ? 1 : 0;
}

component main = MeanGreaterThanThreshold(10, 50);