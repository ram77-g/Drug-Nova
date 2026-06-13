from Bio import pairwise2

seq_a = "MADKTAL"
seq_b = "MADTAL"

identical = pairwise2.align.globalxx(seq_a, seq_b, score_only=True)
print(identical)
