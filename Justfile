set shell := ["cmd.exe", "/c"]

destDir := '..\..\public_html\rucksack-battle'

copy:
    copy index.html {{destDir}}

    
copy-graph-js:
    copy graph.js {{destDir}}

copy-settings-js:
    copy settings.js {{destDir}}