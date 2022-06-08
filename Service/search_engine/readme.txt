0. Скопировать все файлы вложения на сервер БД. 
1. Распаковать архив postgis.zip в папку /home/websys53/postgis (папку предварительно создать).
2. Войти в putty на сервер БД.
3. При наличии подключения к интернет-репозитариям со стороны сервера БД, вывполнить команду:
sudo apt install postgis
  Без наличия подключения к интернет-репозитариям со стороны сервера БД, выполнить команды:
  cd /home/websys53/postgis
  sudo dpkg -i *deb
выслать скриншот putty после окончания работы команд. Ждать подтверждения возможность дальнейшей установки.
5. Выполнить скрипт добавления расширения БД postgis: 
psql -h IP_АДРЕС_СЕРВЕРА_БД -U postgres -d ИМЯ_БД -a -f ~/create_ext.sql -L ~/create_ext.sql.log
6. Выполнить скрипт создания субмодели search_idx:
psql -h IP_АДРЕС_СЕРВЕРА_БД -U postgres -d ИМЯ_БД -a -f ~/create_search_idx_submodel.sql -L ~/create_search_idx_submodel.log
7. Выполнить скрипт заполнения субмодели search_idx данными для поисковой машины:
psql -h IP_АДРЕС_СЕРВЕРА_БД -U postgres -d ИМЯ_БД -a -f ~/insert_search_idx.sql -L ~/insert_search_idx.log
8. Выслать логи выполнения на support@corelight.ru