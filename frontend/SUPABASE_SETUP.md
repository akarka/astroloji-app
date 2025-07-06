# 🗄️ Supabase Setup Guide

## 📋 **Prerequisites**

1. **Supabase Account**: [supabase.com](https://supabase.com)
2. **Project Created**: With the `calculation_results` table

## 🔧 **Environment Variables**

Create a `.env` file in your `frontend` directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ivubmqecvromxplmycyk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dWJtcWVjdnJvbXhwbG15Y3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTI0MjQsImV4cCI6MjA2NzI4ODQyNH0.FjdW-gS2y2ZkhFBt6m_4PJ2FDOA6t2nnawNOzEOqc0s

# API Gateway URL (for your microservices)
VITE_API_GATEWAY_URL=https://your-gateway-url.com //help here
```

## 🗃️ **Database Table Structure**

Your `calculation_results` table should have:

```sql
CREATE TABLE calculation_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  result_json JSONB NOT NULL
);
```

## 🔑 **Getting Your Supabase Credentials**

1. **Go to your Supabase Dashboard**
2. **Select your project**
3. **Go to Settings → API**
4. **Copy:**
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## 🚀 **Features Added**

### ✅ **Birth Chart Storage**

- Automatically saves calculations to Supabase
- Stores person data + planet/house positions
- JSON format for flexible data structure

### ✅ **History Management**

- View all saved calculations
- Load previous calculations
- Delete unwanted records
- Sortable table with search

### ✅ **Real-time Updates**

- Live updates when data changes
- Automatic refresh after operations

## 🎯 **How It Works**

1. **User submits birth chart form**
2. **Calculation is performed** (dummy data for now)
3. **Result is saved to Supabase** automatically
4. **History is updated** in real-time
5. **User can view/load/delete** saved calculations

## 🔒 **Security Notes**

- Uses **Row Level Security (RLS)** for data protection
- **Anonymous key** for public access (can be restricted later)
- **JSONB** for flexible data storage

## 🧪 **Testing**

1. **Fill out the birth chart form**
2. **Submit calculation**
3. **Check "📚 Geçmiş" tab**
4. **Verify data is saved**
5. **Test load/delete functions**

## 🔄 **Next Steps**

1. **Set up your Supabase credentials**
2. **Deploy the updated frontend**
3. **Test the database integration**
4. **Connect to your real API endpoints**

## 📞 **Support**

If you need help with Supabase setup, check:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
