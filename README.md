
# submoudle 첫 사용 등록 방법
1. git submodule add https://github.com/PAPERWARE-Papyrus/paperware-shared src/@shared

# submoudle이 존재하는 경우

## clone 후 실행
1. git submodule update --init --recursive

## submodule update 
1. git submodule update --recursive 

# 주의사항
루트경로에서 받으면 해당 submodule pull이 안받아지기 때문에 submoudle 경로 가서 git submodule update --recursive 별도로 pull 요청 해줘야한다.!
