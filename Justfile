set shell := ["cmd.exe", "/c"]

destDir := '..\..\public_html\rucksack-battle'

copy filename="index.html":
    copy {{filename}} {{destDir}}
