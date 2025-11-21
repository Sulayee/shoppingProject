# shoppingProject

## 專案結構

```text
shoppingProject/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/tw/shopping/
│   │   │       ├── controller/             # 控制器層，處理 HTTP 請求與回應
│   │   │       ├── entity/                 # 資料模型，對應資料庫表格
│   │   │       ├── exception/              # 自訂例外處理類別
│   │   │       ├── repository/             # 資料存取層，使用 Spring Data JPA
│   │   │       ├── service/                # 商業邏輯層，處理核心邏輯
│   │   │       ├── util/                   # 工具類別，輔助功能模組
│   │   │       └── ShoppingProjectApplication.java # 主程式入口
│   │   └── resources/
│   │       ├── static/                     # 靜態資源 (HTML、CSS、JS)
│   │       └── application.properties      # Spring Boot 設定檔
│   └── test/
│       └── java/com/tw/shopping/           # 測試類別
├── pom.xml                                 # Maven 設定檔
├── mvnw
└── mvnw.cmd                                # Maven Wrapper


---

## 各 Package 說明

| Package     | 用途                          | 建議檔案                                   |
|-------------|-------------------------------|--------------------------------------------|
| controller  | 控制器層，處理 API 請求與回應 | `ShoppingController.java`, `UserController.java` |
| entity      | 資料模型，對應資料庫表格      | `Product.java`, `User.java`, `Order.java`  |
| repository  | 資料存取層，定義 JPA 介面     | `ProductRepository.java`, `UserRepository.java` |
| service     | 商業邏輯層，封裝核心功能      | `ProductService.java`, `UserService.java`  |
| util        | 工具類別，輔助功能模組        | -                                          |

---

## MySQL 資料庫設定

 **注意**：請先開啟 **MAMP**，否則 Spring Boot 無法連線到 MySQL。

請在 `src/main/resources/application.properties` 中加入以下設定：

```properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/shopping?useSSL=false&serverTimezone=Asia/Taipei&characterEncoding=utf-8
spring.datasource.username=root
spring.datasource.password=root
