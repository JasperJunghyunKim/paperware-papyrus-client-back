
# submoudle 첫 사용 등록 방법
1. git submodule add https://github.com/PAPERWARE-Papyrus/paperware-shared src/@shared

# submoudle이 존재하는 경우

## clone 후 실행
1. git submodule update --init --recursive

## submodule update 
1. git submodule update --recursive 

## submoudle git pull alias 설정
git config --global alias.pull-sub '!git pull && git submodule update --init --recursive && git submodule foreach --recursive git pull'

git pull-sub 하면 현재 repo 및 submodule도 pull 됩니다.

submodule에서 만약 에러가 나온다면 git pull checkout main으로 하고 난 후 remote push 한뒤 사용하시면 됩니다. (.gitsubmodule만)

# 주의사항
루트경로에서 받으면 해당 submodule pull이 안받아지기 때문에 submoudle 경로 가서 git submodule update --recursive 별도로 pull 요청 해줘야한다.!
