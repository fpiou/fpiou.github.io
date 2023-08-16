# -*- coding: utf-8 -*-
# Ce script génère des questions et réponses pour les fractions
# irréductibles de la forme n + k/a où n est un entier et k et a sont des
# entiers strictement positifs.
# Les questions sont de la forme : Quelle est la forme irréductible de n + k/a ?
# Les réponses sont de la forme : n + k/a = k/a + n = (n*a + k)/a
# Les questions et réponses sont copiées dans le presse-papier.

# Importer le module pour copier dans le presse-papier
import pyperclip

# Define the function to generate the irreducible form
def irreducible_form(n, k, a):
    numerator = n * a + k
    return f"$\\dfrac{{{numerator}}}{{{a}}}$"

# Generate the questions and answers for the provided sequence
questions = []
answers = []

# List of integers
integers = list(range(1, 11))

# List of fractions in the format (numerator, denominator)
fractions = [(1, 2), (1, 3), (2, 3), (1, 4), (3, 4), (1, 5), (2, 5), (3, 5), (4, 5),
            (1, 6), (5, 6), (1, 7), (2, 7), (3, 7), (4, 7), (5, 7), (6, 7), (1, 8),
            (3, 8), (5, 8), (7, 8), (1, 9), (2, 9), (4, 9), (5, 9), (7, 9), (8, 9)]

# Generate the questions and answers
for i in integers:
    for k, a in fractions:
        question = f"$ {i} + \\dfrac{{{k}}}{{{a}}}$"
        answer = irreducible_form(i, k, a)
        questions.append(question)
        answers.append(answer)

text1=""
for i in range(questions.__len__()):
    text1+=f"""<div class="question">
    <p>Quelle est la forme irréductible de {questions[i]} ?</p>
  </div>
  <div class="reponse">{answers[i]}</div>
  """

text2=""
for i in range(questions.__len__()):
    text2+=f"""<div class="question">
    <p>Quelle est la décomposition en sa partie entière et sa partie fractionnaire de {answers[i]} ?</p>
  </div>
  <div class="reponse">{questions[i]}</div>
  """

#pyperclip.copy(text1)
pyperclip.copy(text2)