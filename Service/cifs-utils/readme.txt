1. ����������� ���� cifs-utils ����������� � ������ � ����� /home/websys53 � ��������� �������:
unzip /home/websys53cifs-utils.zip
sudo dpkg -i cifs-utils.deb 

2. ������� � ����� /home/websys53/gis_web77/website ����� � ������� ����� ����������� ������� ����:
mkdir /home/websys53/GIS_WEB60/WebSite/Public/Data/LIB_NAS
3. ��������� ������� �������� ����:
sudo mount -t cifs //XXX.XXX.XXX.XXX/GIS /home/websys53/GIS_WEB60/WebSite/Public/Data/LIB_NAS -o user=usergis,password=YYYYY,sec=ntlm,file_mode=0777,dir_mode=0777
��� XXX.XXX.XXX.XXX - IP-����� �������� ���������
YYYY - ������ ������������ usergis �� ������ � �������� ���������

4.  ��������� ������� �������� � �������������� �������:
 cd /home/websys53/GIS_WEB60/WebSite/Public/Data/LIB_NAS

5. ��������� ��� � ���� �������� ����� ����� �� ����� �������� ���������. ���� ������ - ���� ����� ��� � ����� �����.

6. � ����� � ����� Tasks/NAS ������� ���� nas_auto_run_mount.sh � ����������� ��� ��������� �������:
����������� ������ sudo mount -t cifs //XXX.XXX.XXX.XXX/GIS /home/websys53/GIS_WEB60/WebSite/Public/Data/LIB_NAS -o user=usergis,password=YYYYY,sec=ntlm,file_mode=0777,dir_mode=0777
��� XXX.XXX.XXX.XXX - IP-����� �������� ���������
YYYY - ������ ������������ usergis �� ������ � �������� ���������
��������� ���� � �������� ���� �� ������ ���������� � ����� GIS_WEB60. 

7. ����  nas_auto_run_mount.service, ����������� � ������, ����������� � ����� /lib/systemd/system/

8. ���� ����� ��� ������:
sudo chmod 644 /lib/systemd/system/nas_auto_run_mount.service
sudo chmod u+x /home/websys53/gis_web60/Tasks/NAS/nas_auto_run_mount.sh

9. �������� ������������ � �������� � ������������ Linux ����� ������
sudo systemctl daemon-reload
sudo systemctl enable nas_auto_run_mount.service	

10. ������������� ������ � ������� � ����� �������� ��������� ����� ������ ��� ��� ������������ (����� �����/�����) � �������� ���������:
 cd /home/websys53/GIS_WEB60/WebSite/Public/Data/LIB_NAS

