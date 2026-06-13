from Bio import Align

aligner = Align.PairwiseAligner()
aligner.mode = 'global'
identical = aligner.score("MADKTAL", "MADTAL")
print(identical)
