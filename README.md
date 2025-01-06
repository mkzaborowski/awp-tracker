# Portfolio Management & Investment Calculator

A comprehensive web application for managing and analyzing investment portfolios, featuring real-time calculations, portfolio comparisons, and investment planning tools.

## 🚀 Features

- **Multi-Section Portfolio Management**
    - Track multiple portfolio sections
    - Real-time portfolio value calculations
    - Detailed stock position tracking

- **Portfolio Comparison**
    - Compare different portfolio sections
    - Track differences in positions
    - Analyze performance variations

- **Investment Calculator**
    - Calculate new investment distributions based on current portfolio weights
    - Real-time share purchase calculations
    - Maintain portfolio balance across sections

## 🛠️ Technology Stack

- **Frontend**
    - Next.js 14
    - React 18
    - TailwindCSS
    - shadcn/ui Components
    - Recharts for data visualization

- **Backend**
    - Node.js
    - Express.js
    - JSON data storage

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Frontend Setup
```bash
# Clone the repository
git clone [repository-url]
cd portfolio-manager

# Install dependencies
npm install

# Install required shadcn/ui components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table

# Run development server
npm run dev
```

### Backend Setup
```bash
cd unstaged-api
npm install
npm run dev
```

## 📊 API Endpoints

### Portfolio Data

#### Get Portfolio Data
```
GET /api/awp_state/{ticker}
```
Returns full portfolio data across all sections.

Response structure:
```json
{
  "Section 1": {
    "CompanyName": [{
      "% of portfolio assets": number,
      "Company": string,
      "Ticker": string,
      "TT Score": number,
      "Shares": number,
      "Starting position + adds": number,
      "Current position + adds/sales": number,
      "Price at start/add": number,
      "Day Chng %": number,
      "Current price": number,
      "Price change": number,
      "% Gain/loss": number,
      "Gain/Loss": number
    }]
  },
  "Section 2": {
    // Similar structure
  }
}
```

#### Get Specific Portfolio
```
GET /api/portfolio/{portfolioId}
```
Returns data for a specific portfolio section.

## 📁 Project Structure

```
portfolio-manager/
├── app/
│   ├── index.js           # Home page
│   ├── dashboard.js       # Main dashboard
│   └── investment-calculator.js
├── components/
│   └── ui/               # shadcn components
├── utils/
│   └── auth.js           # Authentication utilities
├── styles/
│   └── globals.css       # Global styles
└── api/                  # Backend API
    ├── awp-state/
    │   └── route.js
    └── data/
        └── portfolio.json
```

## 💡 Usage Examples

### Investment Calculator
```javascript
// Calculate investment distribution
const amount = 100000;
const distribution = calculateInvestments(amount);

// Example output
{
  section: "Section 1",
  company: "Google",
  ticker: "GOOGL",
  currentValue: 50000,
  portfolioPercentage: 10,
  sharesToBuy: 15,
  investment: 49995,
  targetInvestment: 50000
}
```

## 🔒 Security Considerations

- Implement proper authentication
- Secure API endpoints
- Validate user input
- Use environment variables for sensitive data
- Implement rate limiting

## 🔄 State Management

The application uses React's useState and useEffect hooks for state management. Key state elements include:
- Portfolio data
- Investment calculations
- Section selections
- Comparison data

## 📱 Responsive Design

The application is fully responsive and works across:
- Desktop browsers
- Tablets
- Mobile devices

## 🔧 Configuration

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- Large portfolio data may cause performance issues
- Investment calculator rounding differences
- Section switching delay on slow connections

## 🔜 Future Improvements

- Add real-time stock price updates
- Implement user authentication
- Add portfolio history tracking
- Export functionality for reports
- Mobile app development
- Enhanced data visualization

## 👥 Authors

- mkzaborowski - Initial work

## 🙏 Acknowledgments

- shadcn/ui for component library
- Recharts for charting library
- Next.js tea for the framework