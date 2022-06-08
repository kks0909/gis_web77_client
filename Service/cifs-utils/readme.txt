1. Скопитьвать файл cifs-utils приложенный к письму в папку /home/websys53 и выполнить команды:
unzip /home/websys53cifs-utils.zip
sudo dpkg -i cifs-utils.deb 

2. Создать в корне /home/websys53/gis_web77/website папку в которую будем монтировать сетевой диск:
mkdir /home/websys53/GIS_WEB60/WebSite/Public/Data/LIB_NAS
3. Выполняем команду привязки шары:
sudo mount -t cifs //XXX.XXX.XXX.XXX/GIS /home/websys53/GIS_WEB60/WebSite/Public/Data/LIB_NAS -o user=usergis,password=YYYYY,sec=ntlm,file_mode=0777,dir_mode=0777
где XXX.XXX.XXX.XXX - IP-адрес сетевого хранилища
YYYY - пароль пользователя usergis на доступ к сетевому хранилищу

4.  Выполнить команду перехода в смонтированный каталог:
 cd /home/websys53/GIS_WEB60/WebSite/Public/Data/LIB_NAS

5. Убедиться что в этом каталоге видны папки из корня сетевого хранилища. Если пустой - дать знать нам и ждать ответ.

6. В патче в папке Tasks/NAS находим файл nas_auto_run_mount.sh и редактируем его следующим образом:
редактируем строку sudo mount -t cifs //XXX.XXX.XXX.XXX/GIS /home/websys53/GIS_WEB60/WebSite/Public/Data/LIB_NAS -o user=usergis,password=YYYYY,sec=ntlm,file_mode=0777,dir_mode=0777
где XXX.XXX.XXX.XXX - IP-адрес сетевого хранилища
YYYY - пароль пользователя usergis на доступ к сетевому хранилищу
Сохраняем файл и копируем патч на сервер приложений в папку GIS_WEB60. 

7. Файл  nas_auto_run_mount.service, приложенный к письму, скопировать в папку /lib/systemd/system/

8. Дать права для файлов:
sudo chmod 644 /lib/systemd/system/nas_auto_run_mount.service
sudo chmod u+x /home/websys53/gis_web60/Tasks/NAS/nas_auto_run_mount.sh

9. Обновить конфигурацию и добавить в автозагрузку Linux новый скрипт
sudo systemctl daemon-reload
sudo systemctl enable nas_auto_run_mount.service	

10. Перезапустить сервер и перейти в папку сетевого хранилища чтобы понять что она подключилась (видны папки/файлы) к сетевому хранилищу:
 cd /home/websys53/GIS_WEB60/WebSite/Public/Data/LIB_NAS

