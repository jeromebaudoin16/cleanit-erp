const API = 'https://cleanit-erp.onrender.com/api/cleanitbooks';

const getToken = () => localStorage.getItem('token') || '';

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

const safe = async (promise) => {
  try {
    const res = await promise;
    const data = await res.json();
    return data;
  } catch(e) {
    console.warn('CIB API error:', e.message);
    return null;
  }
};

export const getCustomers   = () => safe(fetch(`${API}/customers`,      {headers:headers()}));
export const createCustomer = (dto) => safe(fetch(`${API}/customers`,   {method:'POST',headers:headers(),body:JSON.stringify(dto)}));
export const updateCustomer = (id,dto) => safe(fetch(`${API}/customers/${id}`,{method:'PUT',headers:headers(),body:JSON.stringify(dto)}));
export const deleteCustomer = (id) => safe(fetch(`${API}/customers/${id}`,{method:'DELETE',headers:headers()}));

export const getVendors     = () => safe(fetch(`${API}/vendors`,        {headers:headers()}));
export const createVendor   = (dto) => safe(fetch(`${API}/vendors`,     {method:'POST',headers:headers(),body:JSON.stringify(dto)}));
export const updateVendor   = (id,dto) => safe(fetch(`${API}/vendors/${id}`,{method:'PUT',headers:headers(),body:JSON.stringify(dto)}));

export const getJobs        = () => safe(fetch(`${API}/jobs`,           {headers:headers()}));
export const getJob         = (id) => safe(fetch(`${API}/jobs/${id}`,   {headers:headers()}));
export const createJob      = (dto) => safe(fetch(`${API}/jobs`,        {method:'POST',headers:headers(),body:JSON.stringify(dto)}));
export const updateJob      = (id,dto) => safe(fetch(`${API}/jobs/${id}`,{method:'PUT',headers:headers(),body:JSON.stringify(dto)}));
export const deleteJob      = (id) => safe(fetch(`${API}/jobs/${id}`,   {method:'DELETE',headers:headers()}));

export const getInvoices    = () => safe(fetch(`${API}/invoices`,       {headers:headers()}));
export const getInvoice     = (id) => safe(fetch(`${API}/invoices/${id}`,{headers:headers()}));
export const createInvoice  = (dto) => safe(fetch(`${API}/invoices`,    {method:'POST',headers:headers(),body:JSON.stringify(dto)}));
export const updateInvoice  = (id,dto) => safe(fetch(`${API}/invoices/${id}`,{method:'PUT',headers:headers(),body:JSON.stringify(dto)}));

export const getBills       = () => safe(fetch(`${API}/bills`,          {headers:headers()}));
export const getBill        = (id) => safe(fetch(`${API}/bills/${id}`,  {headers:headers()}));
export const createBill     = (dto) => safe(fetch(`${API}/bills`,       {method:'POST',headers:headers(),body:JSON.stringify(dto)}));
export const updateBill     = (id,dto) => safe(fetch(`${API}/bills/${id}`,{method:'PUT',headers:headers(),body:JSON.stringify(dto)}));

export const getTimeEntries  = () => safe(fetch(`${API}/time`,          {headers:headers()}));
export const createTimeEntry = (dto) => safe(fetch(`${API}/time`,       {method:'POST',headers:headers(),body:JSON.stringify(dto)}));
export const deleteTimeEntry = (id) => safe(fetch(`${API}/time/${id}`,  {method:'DELETE',headers:headers()}));

export const getDashboard   = () => safe(fetch(`${API}/dashboard`,      {headers:headers()}));

// ── Comptabilité ────────────────────────────────────────────────────
export const getAccounts      = (classe)  => safe(fetch(`${API}/accounts${classe?'?classe='+classe:''}`, {headers:headers()}));
export const initPlanComptable= ()         => safe(fetch(`${API}/accounts/init`, {method:'POST',headers:headers()}));
export const getJournal       = (type)    => safe(fetch(`${API}/journal${type?'?type='+type:''}`, {headers:headers()}));
export const getGrandLivre    = (account) => safe(fetch(`${API}/grandlivre${account?'?account='+account:''}`, {headers:headers()}));
export const getBalance       = ()         => safe(fetch(`${API}/balance`, {headers:headers()}));
export const getPL            = ()         => safe(fetch(`${API}/pl`, {headers:headers()}));
export const getBilan         = ()         => safe(fetch(`${API}/bilan`, {headers:headers()}));
export const getPayments      = (type)    => safe(fetch(`${API}/payments${type?'?type='+type:''}`, {headers:headers()}));
export const receivePayment   = (dto)      => safe(fetch(`${API}/payments/receive`, {method:'POST',headers:headers(),body:JSON.stringify(dto)}));
export const payBill          = (dto)      => safe(fetch(`${API}/payments/pay-bill`, {method:'POST',headers:headers(),body:JSON.stringify(dto)}));
export const getFiscalYears   = ()         => safe(fetch(`${API}/fiscal-years`, {headers:headers()}));
export const createFiscalYear = (dto)      => safe(fetch(`${API}/fiscal-years`, {method:'POST',headers:headers(),body:JSON.stringify(dto)}));
export const closeFiscalYear  = (id)       => safe(fetch(`${API}/fiscal-years/${id}/close`, {method:'POST',headers:headers()}));
