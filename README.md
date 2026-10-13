# Bài thực hành 3 - Smart Contract DominionDAO + React Web3

**Sinh viên:** Nguyễn Thị Anh
**MSSV:** B23DCTC007

## Thông tin Contract
- **Network:** Ethereum Sepolia
- **Contract Address:** 0xDeE0885DBB51bd7b15F73C35c820bF1B8E9137A3
- **Tx Deploy:** 0xDeE0885DBB51bd7b15F73C35c820bF1B8E9137A3
- **Etherscan:** https://sepolia.etherscan.io/address/0xDeE0885DBB51bd7b15F73C35c820bF1B8E9137A3

## Địa chỉ ví kiểm thử
- Account 1: 0xbcE4daCb1B1667274bB0D114d4cCcF527353808F
- Account 2: 0xC296Fe96fC01f525f80Ed707243e2435C07a0abE
- Account 3: 0xdE16232d8321b4931Cf54Cb4c79f0bd7C6169333

## Cấu trúc thư mục
- `smartcontract/` - Code Solidity + Hardhat
- `web3-dao/` - Code React Web3

## Hướng dẫn chạy

### Smart Contract
\`\`\`bash
cd smartcontract
npm install
# Sửa hardhat.config.js: thay YOUR_PRIVATE_KEY_HERE bằng private key của bạn
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
\`\`\`

### React Web3
\`\`\`bash
cd web3-dao
npm install
npm run dev
# Truy cập http://localhost:5173
\`\`\`

## Chức năng
1. Kết nối ví MetaMask
2. Đóng góp ETH để trở thành cổ đông (ngưỡng 0.01 ETH)
3. Tạo đề xuất chi quỹ (chỉ cổ đông)
4. Biểu quyết đồng ý / phản đối
5. Giải ngân sau 5 phút nếu đề xuất được thông qua