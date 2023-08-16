# Ce script permet de générer des questions de type "Quel est le résultat de a/b+c/d ?"
# avec a,b premiers entre eux et c,d premiers entre eux
# La réponse est sous la forme irréductible (k*a+c)/d avec k*b et c premiers entre eux
# La réponse n'est pas forcément unique on évite les doublons
# Cela supprime pas mal de cas !

import pyperclip
import math
listea = list(range(1, 10))
listeb = list(range(2, 10))
listec = list(range(1, 10))
listek = list(range(2, 10))
liste =[]
for a in listea:
    for b in listeb:
        for c in listec:
            for k in listek:
                #Vérifier que a et b sont premiers entre eux
                if math.gcd(a, b) == 1:
                  #Vérifier que c et d=k*b sont premiers entre eux
                  d=k*b
                  if math.gcd(c, d) == 1:
                    #Vérifier que ka+c et d=k*b sont premiers entre eux
                    if math.gcd(k*a+c, d) == 1:
                      # Ajouter a,b,c,d,ka, ka+c,  à la liste sous forme de dictionnaire
                      liste.append({"a":a,"b":b,"c":c,"d":d,"k":k,"ka":k*a,"kaplusc":k*a+c})

nb=len(liste)
# On supprime les doublons
liste.append(None)
while None in liste:
    while None in liste:
        liste.remove(None)
    for i in range(liste.__len__()):
      for j in range(liste.__len__()):
          if i!=j:
              if liste[i]!=None and liste[j]!=None and liste[i]["kaplusc"]==liste[j]["kaplusc"] and liste[i]["d"]==liste[j]["d"]:
                  liste[j]=None

print("Il y a ",nb," questions possibles")
print("Il y a ",liste.__len__()," questions sans doublons")
print("Il reste donc ",nb-liste.__len__()," questions non incluses")

text1=""
for i in range(liste.__len__()):
    text1+=f"""<div class="question">
    <p>Quel est le résultat de $\\dfrac{{{liste[i]["a"]}}}{{{liste[i]["b"]}}}+\\dfrac{{{liste[i]["c"]}}}{{{liste[i]["d"]}}}$ ?</p>
  </div>
  <div class="reponse">$\dfrac{{{liste[i]["kaplusc"]}}}{{{liste[i]["d"]}}}$</div>
  """
pyperclip.copy(text1)

# On vérifie qu'il n'y plus de doublons
for i in range(liste.__len__()):
    for j in range(liste.__len__()):
        if i!=j:
            if liste[i]["kaplusc"]==liste[j]["kaplusc"] and liste[i]["d"]==liste[j]["d"]:
                print(liste[i],liste[j])