let map;
let markers = [];
let isEditMode = true;
let currentMarker = null;

// マップの初期化
function initMap() {
    map = L.map('map').setView([35.6895, 139.6917], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // 現在地を取得して表示
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 15);
                
                // 現在地マーカー
                L.marker([latitude, longitude], {
                    icon: L.divIcon({
                        className: 'current-location',
                        html: '📍',
                        iconSize: [25, 25]
                    })
                }).addTo(map);
            },
            error => console.error('位置情報の取得に失敗しました:', error)
        );
    }

    // マップクリックイベント
    map.on('click', function(e) {
        if (isEditMode) {
            addBinMarker(e.latlng);
        }
    });
}

// ゴミ箱マーカーの追加
function addBinMarker(latlng) {
    const name = document.getElementById('binName').value || 'ゴミ箱';
    const marker = L.marker(latlng).addTo(map);
    
    marker.bindPopup(createPopupContent(name));
    markers.push({ marker, name });
    
    if (isEditMode) {
        marker.on('click', function(e) {
            L.DomEvent.stopPropagation(e);
            editMarker(marker);
        });
    }
}

// ポップアップコンテンツの作成
function createPopupContent(name, isEditing = false) {
    if (isEditMode && isEditing) {
        return `
            <div>
                <input type="text" value="${name}" id="editName">
                <button onclick="updateMarker()">更新</button>
                <button onclick="deleteMarker()">削除</button>
            </div>
        `;
    }
    return `<div>${name}</div>`;
}

// マーカーの編集
function editMarker(marker) {
    currentMarker = marker;
    const markerData = markers.find(m => m.marker === marker);
    marker.setPopupContent(createPopupContent(markerData.name, true));
    marker.openPopup();
}

// マーカーの更新
function updateMarker() {
    if (currentMarker) {
        const newName = document.getElementById('editName').value;
        const markerData = markers.find(m => m.marker === currentMarker);
        markerData.name = newName;
        currentMarker.setPopupContent(createPopupContent(newName));
        currentMarker.closePopup();
    }
}

// マーカーの削除
function deleteMarker() {
    if (currentMarker) {
        map.removeLayer(currentMarker);
        markers = markers.filter(m => m.marker !== currentMarker);
        currentMarker = null;
    }
}

// モード切替
document.getElementById('toggleMode').addEventListener('click', function() {
    isEditMode = !isEditMode;
    document.getElementById('editControls').classList.toggle('hidden');
    
    markers.forEach(({ marker, name }) => {
        marker.setPopupContent(createPopupContent(name));
        if (isEditMode) {
            marker.on('click', function(e) {
                L.DomEvent.stopPropagation(e);
                editMarker(marker);
            });
        } else {
            marker.off('click');
        }
    });
    
    this.textContent = isEditMode ? '閲覧モードへ切替' : '編集モードへ切替';
});

// 初期化
window.onload = initMap;