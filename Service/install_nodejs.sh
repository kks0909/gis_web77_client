#!/bin/bash
# version 7.7.3.0
WEB77_PATH="/home/websys53/gis_web77"
echo "Начинаем установку nodejs"
mkdir /home/websys53/nodejs
cd /home/websys53/nodejs
cp ${WEB77_PATH}/website/Service/node/node-v9.11.2-linux-x86.tar.xz /home/websys53/nodejs
sudo mkdir /usr/local/lib/node
sudo tar -xJvf node-v9.11.2-linux-x86.tar.xz
sudo mv node-v9.11.2-linux-x86 nodejs
sudo mv nodejs /usr/local/lib/node/nodejs
sudo rm -f /home/websys53/nodejs
echo "Выдаем права на папку /usr/local/lib/node/"
sudo chmod -R 777 /usr/local/lib/node/
echo "Добавляем пути nodejs в переменные среды NODEJS_HOME, PATH"
echo 'export NODEJS_HOME=/usr/local/lib/node/nodejs' >> /home/websys53/.profile
echo 'export PATH=$NODEJS_HOME/bin:$PATH' >> /home/websys53/.profile
source /home/websys53/.profile
echo "nodejs установлен."
echo "Версия node "`node -v`
echo "Версия npm "`npm -v`
echo "Для детализации версии npm впишите в консоли npm version"
echo "Копируем серверную часть nodejs"
cp -r /home/websys53/patch/nodejs  /home/websys53/gis_web77
echo "Начинаем установку PM2"
npm i ${WEB77_PATH}/website/Service/node/pm2-4.4.0.tgz -g
pm2 startup