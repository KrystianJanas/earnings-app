--
-- PostgreSQL database dump
--

\restrict UnbwCdGKgFlk0t0NYIkdwOma8kRlb0kyoKNcFp2yi6EBBYalZ6Aa2KrehpTMKSS

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'owner',
    'employee'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: get_user_current_company(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_current_company(user_id_param integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_company INTEGER;
    first_company INTEGER;
BEGIN
    -- Try to get user's currently selected company
    SELECT current_company_id INTO current_company
    FROM users 
    WHERE id = user_id_param;
    
    -- If current company is set and user still has access, return it
    IF current_company IS NOT NULL THEN
        IF user_can_access_company(user_id_param, current_company) THEN
            RETURN current_company;
        END IF;
    END IF;
    
    -- Otherwise, get user's first available company (owners first)
    SELECT company_id INTO first_company
    FROM user_companies 
    WHERE user_id = user_id_param AND is_active = TRUE
    ORDER BY role DESC, joined_at ASC
    LIMIT 1;
    
    -- Update user's current company if found
    IF first_company IS NOT NULL THEN
        UPDATE users 
        SET current_company_id = first_company, last_company_switch = CURRENT_TIMESTAMP
        WHERE id = user_id_param;
    END IF;
    
    RETURN first_company;
END;
$$;


ALTER FUNCTION public.get_user_current_company(user_id_param integer) OWNER TO postgres;

--
-- Name: update_client_stats(integer, date, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_client_stats(client_id_param integer, visit_date date, amount_spent numeric) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE clients 
    SET 
        last_visit_date = GREATEST(last_visit_date, visit_date),
        total_visits = total_visits + 1,
        total_spent = total_spent + amount_spent,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = client_id_param;
END;
$$;


ALTER FUNCTION public.update_client_stats(client_id_param integer, visit_date date, amount_spent numeric) OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: user_can_access_company(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.user_can_access_company(user_id_param integer, company_id_param integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    has_access BOOLEAN DEFAULT FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM user_companies 
        WHERE user_id = user_id_param 
        AND company_id = company_id_param 
        AND is_active = TRUE
    ) INTO has_access;
    
    RETURN has_access;
END;
$$;


ALTER FUNCTION public.user_can_access_company(user_id_param integer, company_id_param integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: client_payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_payment_methods (
    id integer NOT NULL,
    client_transaction_id integer,
    amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    payment_method character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT client_payment_methods_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['cash'::character varying, 'card'::character varying, 'blik'::character varying, 'prepaid'::character varying, 'transfer'::character varying, 'free'::character varying])::text[])))
);


ALTER TABLE public.client_payment_methods OWNER TO postgres;

--
-- Name: client_payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_payment_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.client_payment_methods_id_seq OWNER TO postgres;

--
-- Name: client_payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_payment_methods_id_seq OWNED BY public.client_payment_methods.id;


--
-- Name: client_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_transactions (
    id integer NOT NULL,
    daily_earnings_id integer,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(20) NOT NULL,
    client_order integer NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    client_id integer,
    has_multiple_payments boolean DEFAULT false,
    total_amount numeric(10,2) DEFAULT NULL::numeric,
    CONSTRAINT client_transactions_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['cash'::character varying, 'card'::character varying, 'blik'::character varying, 'prepaid'::character varying, 'transfer'::character varying, 'free'::character varying])::text[])))
);


ALTER TABLE public.client_transactions OWNER TO postgres;

--
-- Name: client_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.client_transactions_id_seq OWNER TO postgres;

--
-- Name: client_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_transactions_id_seq OWNED BY public.client_transactions.id;


--
-- Name: client_transactions_with_payments; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.client_transactions_with_payments AS
 SELECT ct.id,
    ct.daily_earnings_id,
    ct.client_order,
    ct.notes,
    ct.created_at,
    ct.updated_at,
        CASE
            WHEN (ct.has_multiple_payments = true) THEN ct.total_amount
            ELSE ct.amount
        END AS total_amount,
        CASE
            WHEN (ct.has_multiple_payments = true) THEN json_agg(json_build_object('amount', cpm.amount, 'method', cpm.payment_method) ORDER BY cpm.id)
            ELSE json_build_array(json_build_object('amount', ct.amount, 'method', ct.payment_method))
        END AS payments
   FROM (public.client_transactions ct
     LEFT JOIN public.client_payment_methods cpm ON (((ct.id = cpm.client_transaction_id) AND (ct.has_multiple_payments = true))))
  GROUP BY ct.id, ct.daily_earnings_id, ct.client_order, ct.notes, ct.created_at, ct.updated_at, ct.amount, ct.payment_method, ct.has_multiple_payments, ct.total_amount;


ALTER TABLE public.client_transactions_with_payments OWNER TO postgres;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    user_id integer,
    full_name character varying(255) NOT NULL,
    phone character varying(20),
    email character varying(255),
    notes text,
    last_visit_date date,
    total_visits integer DEFAULT 0,
    total_spent numeric(10,2) DEFAULT 0.00,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.clients_id_seq OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: daily_earnings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_earnings (
    id integer NOT NULL,
    user_id integer,
    date date NOT NULL,
    cash_amount numeric(10,2) DEFAULT 0.00,
    card_amount numeric(10,2) DEFAULT 0.00,
    tips_amount numeric(10,2) DEFAULT 0.00,
    clients_count integer DEFAULT 0,
    hours_worked numeric(5,2) DEFAULT 0.00,
    notes text,
    entry_mode character varying(20) DEFAULT 'summary'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer,
    CONSTRAINT daily_earnings_entry_mode_check CHECK (((entry_mode)::text = ANY ((ARRAY['summary'::character varying, 'detailed'::character varying])::text[])))
);


ALTER TABLE public.daily_earnings OWNER TO postgres;

--
-- Name: clients_with_recent_activity; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.clients_with_recent_activity AS
 SELECT c.id,
    c.user_id,
    c.company_id,
    c.full_name,
    c.phone,
    c.email,
    c.notes,
    c.created_at,
    c.updated_at,
    count(DISTINCT ct.id) AS total_visits,
    COALESCE(sum(
        CASE
            WHEN (ct.has_multiple_payments = true) THEN ct.total_amount
            ELSE ct.amount
        END), (0)::numeric) AS total_spent,
    max(de.date) AS last_visit_date,
    GREATEST((max(de.date))::timestamp without time zone, c.updated_at) AS last_activity_date
   FROM ((public.clients c
     LEFT JOIN public.client_transactions ct ON ((c.id = ct.client_id)))
     LEFT JOIN public.daily_earnings de ON ((ct.daily_earnings_id = de.id)))
  GROUP BY c.id, c.user_id, c.company_id, c.full_name, c.phone, c.email, c.notes, c.created_at, c.updated_at;


ALTER TABLE public.clients_with_recent_activity OWNER TO postgres;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    address text,
    phone character varying(20),
    email character varying(255),
    website character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.companies_id_seq OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: company_invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_invitations (
    id integer NOT NULL,
    company_id integer,
    inviter_id integer,
    invited_email character varying(255) NOT NULL,
    invited_user_id integer,
    role public.user_role DEFAULT 'employee'::public.user_role NOT NULL,
    invitation_token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    accepted_at timestamp without time zone,
    declined_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.company_invitations OWNER TO postgres;

--
-- Name: company_invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_invitations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_invitations_id_seq OWNER TO postgres;

--
-- Name: company_invitations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_invitations_id_seq OWNED BY public.company_invitations.id;


--
-- Name: daily_earnings_complete; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.daily_earnings_complete AS
 SELECT de.id,
    de.user_id,
    de.company_id,
    de.date,
    de.entry_mode,
    de.cash_amount,
    de.card_amount,
    de.tips_amount,
    de.clients_count,
    de.hours_worked,
    de.notes,
    de.created_at,
    de.updated_at,
    COALESCE(ct_summary.total_cash, (0)::numeric) AS calculated_cash_amount,
    COALESCE(ct_summary.total_card, (0)::numeric) AS calculated_card_amount,
    COALESCE(ct_summary.total_blik, (0)::numeric) AS calculated_blik_amount,
    COALESCE(ct_summary.total_prepaid, (0)::numeric) AS calculated_prepaid_amount,
    COALESCE(ct_summary.total_transfer, (0)::numeric) AS calculated_transfer_amount,
    COALESCE(ct_summary.total_free, (0)::numeric) AS calculated_free_amount,
    COALESCE(ct_summary.client_count_from_transactions, (0)::bigint) AS calculated_clients_count,
        CASE
            WHEN ((de.entry_mode)::text = 'detailed'::text) THEN COALESCE(ct_summary.total_cash, (0)::numeric)
            ELSE de.cash_amount
        END AS effective_cash_amount,
        CASE
            WHEN ((de.entry_mode)::text = 'detailed'::text) THEN COALESCE(ct_summary.total_card, (0)::numeric)
            ELSE de.card_amount
        END AS effective_card_amount,
        CASE
            WHEN ((de.entry_mode)::text = 'detailed'::text) THEN COALESCE(ct_summary.client_count_from_transactions, (0)::bigint)
            ELSE (de.clients_count)::bigint
        END AS effective_clients_count,
    COALESCE(ct_summary.total_blik, (0)::numeric) AS effective_blik_amount,
    COALESCE(ct_summary.total_prepaid, (0)::numeric) AS effective_prepaid_amount,
    COALESCE(ct_summary.total_transfer, (0)::numeric) AS effective_transfer_amount,
    COALESCE(ct_summary.total_free, (0)::numeric) AS effective_free_amount
   FROM (public.daily_earnings de
     LEFT JOIN ( SELECT ct.daily_earnings_id,
            sum(
                CASE
                    WHEN (ct.has_multiple_payments = true) THEN ( SELECT COALESCE(sum(cpm.amount), (0)::numeric) AS "coalesce"
                       FROM public.client_payment_methods cpm
                      WHERE ((cpm.client_transaction_id = ct.id) AND ((cpm.payment_method)::text = 'cash'::text)))
                    WHEN ((ct.payment_method)::text = 'cash'::text) THEN ct.amount
                    ELSE (0)::numeric
                END) AS total_cash,
            sum(
                CASE
                    WHEN (ct.has_multiple_payments = true) THEN ( SELECT COALESCE(sum(cpm.amount), (0)::numeric) AS "coalesce"
                       FROM public.client_payment_methods cpm
                      WHERE ((cpm.client_transaction_id = ct.id) AND ((cpm.payment_method)::text = 'card'::text)))
                    WHEN ((ct.payment_method)::text = 'card'::text) THEN ct.amount
                    ELSE (0)::numeric
                END) AS total_card,
            sum(
                CASE
                    WHEN (ct.has_multiple_payments = true) THEN ( SELECT COALESCE(sum(cpm.amount), (0)::numeric) AS "coalesce"
                       FROM public.client_payment_methods cpm
                      WHERE ((cpm.client_transaction_id = ct.id) AND ((cpm.payment_method)::text = 'blik'::text)))
                    WHEN ((ct.payment_method)::text = 'blik'::text) THEN ct.amount
                    ELSE (0)::numeric
                END) AS total_blik,
            sum(
                CASE
                    WHEN (ct.has_multiple_payments = true) THEN ( SELECT COALESCE(sum(cpm.amount), (0)::numeric) AS "coalesce"
                       FROM public.client_payment_methods cpm
                      WHERE ((cpm.client_transaction_id = ct.id) AND ((cpm.payment_method)::text = 'prepaid'::text)))
                    WHEN ((ct.payment_method)::text = 'prepaid'::text) THEN ct.amount
                    ELSE (0)::numeric
                END) AS total_prepaid,
            sum(
                CASE
                    WHEN (ct.has_multiple_payments = true) THEN ( SELECT COALESCE(sum(cpm.amount), (0)::numeric) AS "coalesce"
                       FROM public.client_payment_methods cpm
                      WHERE ((cpm.client_transaction_id = ct.id) AND ((cpm.payment_method)::text = 'transfer'::text)))
                    WHEN ((ct.payment_method)::text = 'transfer'::text) THEN ct.amount
                    ELSE (0)::numeric
                END) AS total_transfer,
            sum(
                CASE
                    WHEN (ct.has_multiple_payments = true) THEN ( SELECT COALESCE(sum(cpm.amount), (0)::numeric) AS "coalesce"
                       FROM public.client_payment_methods cpm
                      WHERE ((cpm.client_transaction_id = ct.id) AND ((cpm.payment_method)::text = 'free'::text)))
                    WHEN ((ct.payment_method)::text = 'free'::text) THEN ct.amount
                    ELSE (0)::numeric
                END) AS total_free,
            count(
                CASE
                    WHEN (((ct.has_multiple_payments = true) AND (ct.total_amount > (0)::numeric)) OR ((ct.has_multiple_payments = false) AND (ct.amount > (0)::numeric))) THEN 1
                    ELSE NULL::integer
                END) AS client_count_from_transactions
           FROM public.client_transactions ct
          GROUP BY ct.daily_earnings_id) ct_summary ON ((de.id = ct_summary.daily_earnings_id)));


ALTER TABLE public.daily_earnings_complete OWNER TO postgres;

--
-- Name: daily_earnings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_earnings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.daily_earnings_id_seq OWNER TO postgres;

--
-- Name: daily_earnings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_earnings_id_seq OWNED BY public.daily_earnings.id;


--
-- Name: user_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_companies (
    id integer NOT NULL,
    user_id integer,
    company_id integer,
    role public.user_role DEFAULT 'employee'::public.user_role NOT NULL,
    is_active boolean DEFAULT true,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_companies OWNER TO postgres;

--
-- Name: user_companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_companies_id_seq OWNER TO postgres;

--
-- Name: user_companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_companies_id_seq OWNED BY public.user_companies.id;


--
-- Name: user_companies_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_companies_view AS
 SELECT uc.user_id,
    uc.company_id,
    c.name AS company_name,
    c.description AS company_description,
    uc.role,
    uc.is_active,
    uc.joined_at,
    ( SELECT count(*) AS count
           FROM public.user_companies uc2
          WHERE ((uc2.company_id = uc.company_id) AND (uc2.is_active = true))) AS total_employees,
    ((( SELECT count(*) AS count
           FROM public.user_companies uc3
          WHERE ((uc3.company_id = uc.company_id) AND (uc3.role = 'owner'::public.user_role) AND (uc3.is_active = true))) = 1) AND (uc.role = 'owner'::public.user_role)) AS is_sole_owner
   FROM (public.user_companies uc
     JOIN public.companies c ON ((uc.company_id = c.id)))
  WHERE (uc.is_active = true)
  ORDER BY uc.role DESC, c.name;


ALTER TABLE public.user_companies_view OWNER TO postgres;

--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_settings (
    id integer NOT NULL,
    user_id integer,
    hourly_rate numeric(8,2) DEFAULT 0.00,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer
);


ALTER TABLE public.user_settings OWNER TO postgres;

--
-- Name: user_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_settings_id_seq OWNER TO postgres;

--
-- Name: user_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_settings_id_seq OWNED BY public.user_settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    current_company_id integer,
    last_company_switch timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: client_payment_methods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_payment_methods ALTER COLUMN id SET DEFAULT nextval('public.client_payment_methods_id_seq'::regclass);


--
-- Name: client_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_transactions ALTER COLUMN id SET DEFAULT nextval('public.client_transactions_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: company_invitations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_invitations ALTER COLUMN id SET DEFAULT nextval('public.company_invitations_id_seq'::regclass);


--
-- Name: daily_earnings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_earnings ALTER COLUMN id SET DEFAULT nextval('public.daily_earnings_id_seq'::regclass);


--
-- Name: user_companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies ALTER COLUMN id SET DEFAULT nextval('public.user_companies_id_seq'::regclass);


--
-- Name: user_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings ALTER COLUMN id SET DEFAULT nextval('public.user_settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: client_payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_payment_methods (id, client_transaction_id, amount, payment_method, created_at, updated_at) FROM stdin;
3	175	35.00	cash	2025-09-30 10:03:27.363783	2025-09-30 10:03:27.363783
4	176	192.50	cash	2025-09-30 10:03:27.363783	2025-09-30 10:03:27.363783
5	177	22.50	card	2025-09-30 10:03:27.363783	2025-09-30 10:03:27.363783
6	178	145.00	free	2025-09-30 10:03:27.363783	2025-09-30 10:03:27.363783
29	200	160.00	card	2025-10-01 17:44:10.02458	2025-10-01 17:44:10.02458
30	201	126.00	cash	2025-10-01 17:44:10.02458	2025-10-01 17:44:10.02458
31	201	14.00	prepaid	2025-10-01 17:44:10.02458	2025-10-01 17:44:10.02458
32	202	80.00	cash	2025-10-01 21:46:44.42664	2025-10-01 21:46:44.42664
33	203	80.00	cash	2025-10-01 21:48:52.52022	2025-10-01 21:48:52.52022
36	206	50.00	cash	2025-10-01 21:51:26.671758	2025-10-01 21:51:26.671758
45	214	160.00	card	2025-10-04 09:09:19.212212	2025-10-04 09:09:19.212212
46	215	140.00	transfer	2025-10-04 09:10:01.409727	2025-10-04 09:10:01.409727
47	216	160.00	card	2025-10-04 09:10:01.409727	2025-10-04 09:10:01.409727
48	217	204.00	card	2025-10-04 09:10:01.409727	2025-10-04 09:10:01.409727
49	218	60.00	cash	2025-10-04 09:10:01.409727	2025-10-04 09:10:01.409727
50	219	225.00	card	2025-10-09 08:50:47.015751	2025-10-09 08:50:47.015751
52	221	155.00	card	2025-10-09 20:47:13.490035	2025-10-09 20:47:13.490035
53	222	140.00	card	2025-10-12 18:50:02.771265	2025-10-12 18:50:02.771265
54	223	120.00	card	2025-10-12 18:50:02.771265	2025-10-12 18:50:02.771265
55	224	155.00	cash	2025-10-12 18:50:02.771265	2025-10-12 18:50:02.771265
56	225	140.00	card	2025-10-12 18:50:02.771265	2025-10-12 18:50:02.771265
57	226	80.00	cash	2025-10-14 18:42:54.378794	2025-10-14 18:42:54.378794
66	235	70.00	blik	2025-10-23 13:36:34.09941	2025-10-23 13:36:34.09941
67	236	50.00	cash	2025-10-23 13:37:15.229498	2025-10-23 13:37:15.229498
68	237	80.00	cash	2025-10-23 13:37:15.229498	2025-10-23 13:37:15.229498
70	239	80.00	cash	2025-10-23 22:25:43.307048	2025-10-23 22:25:43.307048
74	242	50.00	cash	2025-10-23 22:30:40.585051	2025-10-23 22:30:40.585051
75	243	50.00	cash	2025-10-23 22:30:40.585051	2025-10-23 22:30:40.585051
76	243	30.00	blik	2025-10-23 22:30:40.585051	2025-10-23 22:30:40.585051
77	244	80.00	cash	2025-11-05 20:50:35.642322	2025-11-05 20:50:35.642322
78	245	80.00	cash	2025-11-13 19:41:57.645545	2025-11-13 19:41:57.645545
79	246	70.00	blik	2025-11-13 19:42:15.959191	2025-11-13 19:42:15.959191
80	247	100.00	blik	2025-11-14 19:39:32.206516	2025-11-14 19:39:32.206516
81	248	80.00	cash	2025-11-20 18:24:14.266852	2025-11-20 18:24:14.266852
82	249	80.00	cash	2025-11-20 18:24:14.266852	2025-11-20 18:24:14.266852
83	250	80.00	blik	2025-11-20 18:24:48.427697	2025-11-20 18:24:48.427697
84	251	80.00	cash	2025-11-26 20:50:07.897116	2025-11-26 20:50:07.897116
85	252	50.00	cash	2025-11-26 20:50:47.174884	2025-11-26 20:50:47.174884
92	259	50.00	cash	2025-12-01 14:33:58.405869	2025-12-01 14:33:58.405869
93	260	50.00	blik	2025-12-01 14:33:58.405869	2025-12-01 14:33:58.405869
94	261	70.00	blik	2025-12-01 14:36:29.406559	2025-12-01 14:36:29.406559
95	262	110.00	cash	2025-12-02 12:41:39.926175	2025-12-02 12:41:39.926175
96	263	80.00	cash	2025-12-11 20:33:51.808896	2025-12-11 20:33:51.808896
97	264	80.00	cash	2025-12-15 19:54:54.754207	2025-12-15 19:54:54.754207
99	266	80.00	blik	2025-12-16 20:13:08.777076	2025-12-16 20:13:08.777076
100	267	80.00	cash	2025-12-17 10:17:37.694722	2025-12-17 10:17:37.694722
101	268	100.00	cash	2025-12-18 20:49:46.687086	2025-12-18 20:49:46.687086
102	269	80.00	blik	2025-12-21 22:59:54.601592	2025-12-21 22:59:54.601592
103	270	80.00	cash	2026-01-01 15:04:50.339749	2026-01-01 15:04:50.339749
105	272	80.00	cash	2026-01-09 15:19:02.073561	2026-01-09 15:19:02.073561
106	273	100.00	cash	2026-01-09 15:19:02.073561	2026-01-09 15:19:02.073561
109	276	80.00	blik	2026-01-13 19:33:12.24631	2026-01-13 19:33:12.24631
110	277	80.00	cash	2026-01-22 18:33:41.257248	2026-01-22 18:33:41.257248
111	278	150.00	cash	2026-01-22 18:35:15.169533	2026-01-22 18:35:15.169533
113	280	100.00	cash	2026-01-22 18:37:11.885697	2026-01-22 18:37:11.885697
114	281	70.00	blik	2026-01-24 22:04:04.46376	2026-01-24 22:04:04.46376
\.


--
-- Data for Name: client_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_transactions (id, daily_earnings_id, amount, payment_method, client_order, notes, created_at, updated_at, client_id, has_multiple_payments, total_amount) FROM stdin;
244	144	80.00	cash	1	\N	2025-11-05 20:50:35.642322	2025-11-05 20:50:35.642322	4	f	80.00
247	147	100.00	blik	1	\N	2025-11-14 19:39:32.206516	2025-11-14 19:39:32.206516	9	f	100.00
251	150	80.00	cash	1	\N	2025-11-26 20:50:07.897116	2025-11-26 20:50:07.897116	4	f	80.00
15	3	170.00	cash	1	\N	2025-09-11 19:28:18.265328	2025-09-11 19:28:18.265328	\N	f	\N
16	3	140.00	cash	2	\N	2025-09-11 19:28:18.265328	2025-09-11 19:28:18.265328	\N	f	\N
17	3	170.00	cash	3	\N	2025-09-11 19:28:18.265328	2025-09-11 19:28:18.265328	\N	f	\N
18	3	120.00	card	4	\N	2025-09-11 19:28:18.265328	2025-09-11 19:28:18.265328	\N	f	\N
19	3	115.00	card	5	\N	2025-09-11 19:28:18.265328	2025-09-11 19:28:18.265328	\N	f	\N
20	4	35.00	card	1	\N	2025-09-11 19:28:30.03239	2025-09-11 19:28:30.03239	\N	f	\N
21	4	155.00	card	2	\N	2025-09-11 19:28:30.03239	2025-09-11 19:28:30.03239	\N	f	\N
22	4	215.00	card	3	\N	2025-09-11 19:28:30.03239	2025-09-11 19:28:30.03239	\N	f	\N
23	4	145.00	card	4	\N	2025-09-11 19:28:30.03239	2025-09-11 19:28:30.03239	\N	f	\N
24	4	160.00	cash	5	\N	2025-09-11 19:28:30.03239	2025-09-11 19:28:30.03239	\N	f	\N
25	5	215.00	card	1	\N	2025-09-11 19:28:49.684596	2025-09-11 19:28:49.684596	\N	f	\N
26	5	140.00	card	2	\N	2025-09-11 19:28:49.684596	2025-09-11 19:28:49.684596	\N	f	\N
27	9	155.00	card	1	\N	2025-09-11 19:31:12.686958	2025-09-11 19:31:12.686958	\N	f	\N
28	9	180.00	cash	2	\N	2025-09-11 19:31:12.686958	2025-09-11 19:31:12.686958	\N	f	\N
29	9	75.00	cash	3	\N	2025-09-11 19:31:12.686958	2025-09-11 19:31:12.686958	\N	f	\N
30	9	100.00	card	4	\N	2025-09-11 19:31:12.686958	2025-09-11 19:31:12.686958	\N	f	\N
31	9	50.00	card	5	\N	2025-09-11 19:31:12.686958	2025-09-11 19:31:12.686958	\N	f	\N
32	9	140.00	card	6	\N	2025-09-11 19:31:12.686958	2025-09-11 19:31:12.686958	\N	f	\N
33	10	140.00	cash	1	\N	2025-09-11 19:32:21.74757	2025-09-11 19:32:21.74757	\N	f	\N
34	10	207.20	cash	2	\N	2025-09-11 19:32:21.74757	2025-09-11 19:32:21.74757	\N	f	\N
35	10	10.80	card	3	\N	2025-09-11 19:32:21.74757	2025-09-11 19:32:21.74757	\N	f	\N
36	10	135.00	card	4	\N	2025-09-11 19:32:21.74757	2025-09-11 19:32:21.74757	\N	f	\N
37	11	325.00	cash	1	\N	2025-09-11 19:33:23.050641	2025-09-11 19:33:23.050641	\N	f	\N
38	11	145.00	card	2	\N	2025-09-11 19:33:23.050641	2025-09-11 19:33:23.050641	\N	f	\N
39	11	127.00	cash	3	\N	2025-09-11 19:33:23.050641	2025-09-11 19:33:23.050641	\N	f	\N
40	11	56.00	card	4	\N	2025-09-11 19:33:23.050641	2025-09-11 19:33:23.050641	\N	f	\N
41	11	175.00	card	5	\N	2025-09-11 19:33:23.050641	2025-09-11 19:33:23.050641	\N	f	\N
42	11	133.00	card	6	\N	2025-09-11 19:33:23.050641	2025-09-11 19:33:23.050641	\N	f	\N
43	12	260.00	card	1	\N	2025-09-11 19:33:47.410456	2025-09-11 19:33:47.410456	\N	f	\N
44	12	260.00	card	2	\N	2025-09-11 19:33:47.410456	2025-09-11 19:33:47.410456	\N	f	\N
45	12	80.00	cash	3	\N	2025-09-11 19:33:47.410456	2025-09-11 19:33:47.410456	\N	f	\N
46	13	170.00	card	1	\N	2025-09-11 19:34:29.115163	2025-09-11 19:34:29.115163	\N	f	\N
47	13	120.00	cash	2	\N	2025-09-11 19:34:29.115163	2025-09-11 19:34:29.115163	\N	f	\N
48	13	242.00	cash	3	\N	2025-09-11 19:34:29.115163	2025-09-11 19:34:29.115163	\N	f	\N
49	13	28.00	card	4	\N	2025-09-11 19:34:29.115163	2025-09-11 19:34:29.115163	\N	f	\N
50	13	190.00	cash	5	\N	2025-09-11 19:34:29.115163	2025-09-11 19:34:29.115163	\N	f	\N
51	13	40.00	cash	6	\N	2025-09-11 19:34:29.115163	2025-09-11 19:34:29.115163	\N	f	\N
52	13	55.00	card	7	\N	2025-09-11 19:34:29.115163	2025-09-11 19:34:29.115163	\N	f	\N
53	14	155.00	cash	1	\N	2025-09-11 19:35:08.126578	2025-09-11 19:35:08.126578	\N	f	\N
54	14	140.00	card	2	\N	2025-09-11 19:35:08.126578	2025-09-11 19:35:08.126578	\N	f	\N
55	14	140.00	card	3	\N	2025-09-11 19:35:08.126578	2025-09-11 19:35:08.126578	\N	f	\N
56	14	100.00	card	4	\N	2025-09-11 19:35:08.126578	2025-09-11 19:35:08.126578	\N	f	\N
57	14	80.00	cash	5	\N	2025-09-11 19:35:08.126578	2025-09-11 19:35:08.126578	\N	f	\N
58	14	170.00	card	6	\N	2025-09-11 19:35:08.126578	2025-09-11 19:35:08.126578	\N	f	\N
59	15	17.50	card	1	\N	2025-09-11 19:35:58.839662	2025-09-11 19:35:58.839662	\N	f	\N
60	15	157.50	cash	2	\N	2025-09-11 19:35:58.839662	2025-09-11 19:35:58.839662	\N	f	\N
61	15	135.00	cash	3	\N	2025-09-11 19:35:58.839662	2025-09-11 19:35:58.839662	\N	f	\N
62	15	60.00	card	4	\N	2025-09-11 19:35:58.839662	2025-09-11 19:35:58.839662	\N	f	\N
63	15	166.50	cash	5	\N	2025-09-11 19:35:58.839662	2025-09-11 19:35:58.839662	\N	f	\N
64	15	18.50	card	6	\N	2025-09-11 19:35:58.839662	2025-09-11 19:35:58.839662	\N	f	\N
65	15	140.00	cash	7	\N	2025-09-11 19:35:58.839662	2025-09-11 19:35:58.839662	\N	f	\N
66	16	140.00	card	1	\N	2025-09-11 19:36:21.093897	2025-09-11 19:36:21.093897	\N	f	\N
67	16	90.00	card	2	\N	2025-09-11 19:36:21.093897	2025-09-11 19:36:21.093897	\N	f	\N
68	16	200.00	card	3	\N	2025-09-11 19:36:21.093897	2025-09-11 19:36:21.093897	\N	f	\N
69	16	40.00	cash	4	\N	2025-09-11 19:36:21.093897	2025-09-11 19:36:21.093897	\N	f	\N
70	17	215.00	card	1	\N	2025-09-11 19:36:52.160139	2025-09-11 19:36:52.160139	\N	f	\N
71	17	145.00	cash	2	\N	2025-09-11 19:36:52.160139	2025-09-11 19:36:52.160139	\N	f	\N
72	17	21.50	card	3	\N	2025-09-11 19:36:52.160139	2025-09-11 19:36:52.160139	\N	f	\N
73	17	193.50	cash	4	\N	2025-09-11 19:36:52.160139	2025-09-11 19:36:52.160139	\N	f	\N
74	18	215.00	card	1	\N	2025-09-11 19:37:17.757981	2025-09-11 19:37:17.757981	\N	f	\N
75	18	350.00	cash	2	\N	2025-09-11 19:37:17.757981	2025-09-11 19:37:17.757981	\N	f	\N
76	18	14.00	card	3	\N	2025-09-11 19:37:17.757981	2025-09-11 19:37:17.757981	\N	f	\N
77	18	126.00	cash	4	\N	2025-09-11 19:37:17.757981	2025-09-11 19:37:17.757981	\N	f	\N
78	19	120.00	card	1	\N	2025-09-11 19:38:01.78326	2025-09-11 19:38:01.78326	\N	f	\N
79	19	161.00	cash	2	\N	2025-09-11 19:38:01.78326	2025-09-11 19:38:01.78326	\N	f	\N
80	19	14.00	card	3	\N	2025-09-11 19:38:01.78326	2025-09-11 19:38:01.78326	\N	f	\N
81	19	140.00	card	4	\N	2025-09-11 19:38:01.78326	2025-09-11 19:38:01.78326	\N	f	\N
82	19	140.00	card	5	\N	2025-09-11 19:38:01.78326	2025-09-11 19:38:01.78326	\N	f	\N
83	20	215.00	card	1	\N	2025-09-11 19:40:27.376684	2025-09-11 19:40:27.376684	\N	f	\N
84	20	170.00	card	2	\N	2025-09-11 19:40:27.376684	2025-09-11 19:40:27.376684	\N	f	\N
85	20	14.00	card	3	\N	2025-09-11 19:40:27.376684	2025-09-11 19:40:27.376684	\N	f	\N
86	20	170.00	cash	4	\N	2025-09-11 19:40:27.376684	2025-09-11 19:40:27.376684	\N	f	\N
87	20	120.00	card	5	\N	2025-09-11 19:40:27.376684	2025-09-11 19:40:27.376684	\N	f	\N
88	21	126.00	cash	1	\N	2025-09-11 19:41:21.794747	2025-09-11 19:41:21.794747	\N	f	\N
89	21	14.00	card	2	\N	2025-09-11 19:41:21.794747	2025-09-11 19:41:21.794747	\N	f	\N
90	21	60.00	card	3	\N	2025-09-11 19:41:21.794747	2025-09-11 19:41:21.794747	\N	f	\N
91	21	30.00	card	4	\N	2025-09-11 19:41:21.794747	2025-09-11 19:41:21.794747	\N	f	\N
92	21	180.00	cash	5	\N	2025-09-11 19:41:21.794747	2025-09-11 19:41:21.794747	\N	f	\N
93	22	178.00	card	1	\N	2025-09-11 19:42:07.887792	2025-09-11 19:42:07.887792	\N	f	\N
94	22	135.00	card	2	\N	2025-09-11 19:42:07.887792	2025-09-11 19:42:07.887792	\N	f	\N
95	22	140.00	card	3	\N	2025-09-11 19:42:07.887792	2025-09-11 19:42:07.887792	\N	f	\N
96	22	90.00	cash	4	\N	2025-09-11 19:42:07.887792	2025-09-11 19:42:07.887792	\N	f	\N
97	22	120.00	card	5	\N	2025-09-11 19:42:07.887792	2025-09-11 19:42:07.887792	\N	f	\N
98	23	155.00	card	1	\N	2025-09-11 19:42:53.249718	2025-09-11 19:42:53.249718	\N	f	\N
99	23	170.00	card	2	\N	2025-09-11 19:42:53.249718	2025-09-11 19:42:53.249718	\N	f	\N
100	23	170.00	card	3	\N	2025-09-11 19:42:53.249718	2025-09-11 19:42:53.249718	\N	f	\N
101	23	50.00	card	4	\N	2025-09-11 19:42:53.249718	2025-09-11 19:42:53.249718	\N	f	\N
102	23	35.00	card	5	\N	2025-09-11 19:42:53.249718	2025-09-11 19:42:53.249718	\N	f	\N
103	24	120.00	card	1	\N	2025-09-11 19:43:33.73314	2025-09-11 19:43:33.73314	\N	f	\N
104	24	60.00	card	2	\N	2025-09-11 19:43:33.73314	2025-09-11 19:43:33.73314	\N	f	\N
105	24	140.00	card	3	\N	2025-09-11 19:43:33.73314	2025-09-11 19:43:33.73314	\N	f	\N
106	24	60.00	card	4	\N	2025-09-11 19:43:33.73314	2025-09-11 19:43:33.73314	\N	f	\N
107	24	10.00	card	5	\N	2025-09-11 19:43:33.73314	2025-09-11 19:43:33.73314	\N	f	\N
108	25	140.00	card	1	\N	2025-09-11 19:44:14.295426	2025-09-11 19:44:14.295426	\N	f	\N
109	25	215.00	card	2	\N	2025-09-11 19:44:14.295426	2025-09-11 19:44:14.295426	\N	f	\N
110	25	150.00	card	3	\N	2025-09-11 19:44:14.295426	2025-09-11 19:44:14.295426	\N	f	\N
111	25	140.00	cash	4	\N	2025-09-11 19:44:14.295426	2025-09-11 19:44:14.295426	\N	f	\N
112	25	35.00	card	5	\N	2025-09-11 19:44:14.295426	2025-09-11 19:44:14.295426	\N	f	\N
113	1	135.00	card	1	\N	2025-09-11 19:44:40.79239	2025-09-11 19:44:40.79239	\N	f	\N
114	1	150.00	card	2	\N	2025-09-11 19:44:40.79239	2025-09-11 19:44:40.79239	\N	f	\N
118	28	145.00	card	1	\N	2025-09-18 20:34:03.278182	2025-09-18 20:34:03.278182	\N	f	\N
119	28	12.00	card	2	\N	2025-09-18 20:34:03.278182	2025-09-18 20:34:03.278182	\N	f	\N
120	28	120.00	cash	3	\N	2025-09-18 20:34:03.278182	2025-09-18 20:34:03.278182	\N	f	\N
121	28	125.00	cash	4	\N	2025-09-18 20:34:03.278182	2025-09-18 20:34:03.278182	\N	f	\N
122	28	15.00	card	5	\N	2025-09-18 20:34:03.278182	2025-09-18 20:34:03.278182	\N	f	\N
123	28	135.00	card	6	\N	2025-09-18 20:34:03.278182	2025-09-18 20:34:03.278182	\N	f	\N
125	27	120.00	card	1	\N	2025-09-18 20:35:28.679204	2025-09-18 20:35:28.679204	\N	f	\N
126	27	135.00	card	2	\N	2025-09-18 20:35:28.679204	2025-09-18 20:35:28.679204	\N	f	\N
127	27	230.00	card	3	\N	2025-09-18 20:35:28.679204	2025-09-18 20:35:28.679204	\N	f	\N
132	32	185.00	card	1	\N	2025-09-20 12:24:31.740681	2025-09-20 12:24:31.740681	\N	f	\N
133	32	130.00	card	2	\N	2025-09-20 12:24:31.740681	2025-09-20 12:24:31.740681	\N	f	\N
134	32	144.00	card	3	\N	2025-09-20 12:24:31.740681	2025-09-20 12:24:31.740681	\N	f	\N
135	34	165.00	card	1	\N	2025-09-22 09:12:37.758853	2025-09-22 09:12:37.758853	\N	f	\N
245	145	80.00	cash	1	\N	2025-11-13 19:41:57.645545	2025-11-13 19:41:57.645545	2	f	80.00
246	146	70.00	blik	1	\N	2025-11-13 19:42:15.959191	2025-11-13 19:42:15.959191	6	f	70.00
248	148	80.00	cash	1	\N	2025-11-20 18:24:14.266852	2025-11-20 18:24:14.266852	5	f	80.00
249	148	80.00	cash	2	\N	2025-11-20 18:24:14.266852	2025-11-20 18:24:14.266852	3	f	80.00
143	36	365.00	card	1	\N	2025-09-25 16:06:54.976777	2025-09-25 16:06:54.976777	\N	f	\N
144	36	165.00	cash	2	\N	2025-09-25 16:06:54.976777	2025-09-25 16:06:54.976777	\N	f	\N
145	36	140.00	cash	3	\N	2025-09-25 16:06:54.976777	2025-09-25 16:06:54.976777	\N	f	\N
146	36	120.00	card	4	\N	2025-09-25 16:06:54.976777	2025-09-25 16:06:54.976777	\N	f	\N
250	149	80.00	blik	1	\N	2025-11-20 18:24:48.427697	2025-11-20 18:24:48.427697	10	f	80.00
252	151	50.00	cash	1	\N	2025-11-26 20:50:47.174884	2025-11-26 20:50:47.174884	4	f	50.00
150	40	280.00	card	1	\N	2025-09-26 12:42:21.267006	2025-09-26 12:42:21.267006	\N	f	\N
151	40	60.00	cash	2	\N	2025-09-26 12:42:21.267006	2025-09-26 12:42:21.267006	\N	f	\N
157	29	202.50	cash	1	\N	2025-09-29 18:38:46.890485	2025-09-29 18:38:46.890485	\N	f	\N
158	29	22.50	card	2	\N	2025-09-29 18:38:46.890485	2025-09-29 18:38:46.890485	\N	f	\N
159	29	150.00	card	3	\N	2025-09-29 18:38:46.890485	2025-09-29 18:38:46.890485	\N	f	\N
160	45	150.00	cash	1	\N	2025-09-29 18:39:49.338864	2025-09-29 18:39:49.338864	\N	f	\N
259	154	50.00	cash	1	\N	2025-12-01 14:33:58.405869	2025-12-01 14:33:58.405869	3	f	50.00
260	154	50.00	blik	2	\N	2025-12-01 14:33:58.405869	2025-12-01 14:33:58.405869	13	f	50.00
261	158	70.00	blik	1	\N	2025-12-01 14:36:29.406559	2025-12-01 14:36:29.406559	6	f	70.00
175	43	35.00	cash	1	\N	2025-09-30 10:03:27.363783	2025-09-30 10:03:27.363783	\N	f	35.00
176	43	192.50	cash	2	\N	2025-09-30 10:03:27.363783	2025-09-30 10:03:27.363783	\N	f	192.50
177	43	22.50	card	3	\N	2025-09-30 10:03:27.363783	2025-09-30 10:03:27.363783	\N	f	22.50
178	43	145.00	free	4	\N	2025-09-30 10:03:27.363783	2025-09-30 10:03:27.363783	1	f	145.00
262	159	110.00	cash	1	\N	2025-12-02 12:41:39.926175	2025-12-02 12:41:39.926175	7	f	110.00
263	160	80.00	cash	1	\N	2025-12-11 20:33:51.808896	2025-12-11 20:33:51.808896	9	f	80.00
264	161	80.00	cash	1	\N	2025-12-15 19:54:54.754207	2025-12-15 19:54:54.754207	2	f	80.00
266	162	80.00	blik	1	\N	2025-12-16 20:13:08.777076	2025-12-16 20:13:08.777076	10	f	80.00
267	164	80.00	cash	1	\N	2025-12-17 10:17:37.694722	2025-12-17 10:17:37.694722	5	f	80.00
268	165	100.00	cash	1	\N	2025-12-18 20:49:46.687086	2025-12-18 20:49:46.687086	4	f	100.00
269	166	80.00	blik	1	\N	2025-12-21 22:59:54.601592	2025-12-21 22:59:54.601592	6	f	80.00
270	167	80.00	cash	1	\N	2026-01-01 15:04:50.339749	2026-01-01 15:04:50.339749	14	f	80.00
272	168	80.00	cash	1	\N	2026-01-09 15:19:02.073561	2026-01-09 15:19:02.073561	10	f	80.00
273	168	100.00	cash	2	\N	2026-01-09 15:19:02.073561	2026-01-09 15:19:02.073561	15	f	100.00
276	172	80.00	blik	1	\N	2026-01-13 19:33:12.24631	2026-01-13 19:33:12.24631	3	f	80.00
277	173	80.00	cash	1	\N	2026-01-22 18:33:41.257248	2026-01-22 18:33:41.257248	14	f	80.00
278	170	150.00	cash	1	\N	2026-01-22 18:35:15.169533	2026-01-22 18:35:15.169533	9	f	150.00
200	93	160.00	card	1	\N	2025-10-01 17:44:10.02458	2025-10-01 17:44:10.02458	\N	f	160.00
201	93	140.00	cash	2	\N	2025-10-01 17:44:10.02458	2025-10-01 17:44:10.02458	\N	t	140.00
202	95	80.00	cash	1	\N	2025-10-01 21:46:44.42664	2025-10-01 21:46:44.42664	2	f	80.00
203	96	80.00	cash	1	\N	2025-10-01 21:48:52.52022	2025-10-01 21:48:52.52022	3	f	80.00
280	171	100.00	cash	1	\N	2026-01-22 18:37:11.885697	2026-01-22 18:37:11.885697	16	f	100.00
206	62	50.00	cash	1	\N	2025-10-01 21:51:26.671758	2025-10-01 21:51:26.671758	5	f	50.00
281	179	70.00	blik	1	\N	2026-01-24 22:04:04.46376	2026-01-24 22:04:04.46376	6	f	70.00
214	103	160.00	card	1	\N	2025-10-04 09:09:19.212212	2025-10-04 09:09:19.212212	\N	f	160.00
215	102	140.00	transfer	1	\N	2025-10-04 09:10:01.409727	2025-10-04 09:10:01.409727	\N	f	140.00
216	102	160.00	card	2	\N	2025-10-04 09:10:01.409727	2025-10-04 09:10:01.409727	\N	f	160.00
217	102	204.00	card	3	\N	2025-10-04 09:10:01.409727	2025-10-04 09:10:01.409727	\N	f	204.00
218	102	60.00	cash	4	\N	2025-10-04 09:10:01.409727	2025-10-04 09:10:01.409727	\N	f	60.00
219	106	225.00	card	1	\N	2025-10-09 08:50:47.015751	2025-10-09 08:50:47.015751	\N	f	225.00
221	35	155.00	card	1	\N	2025-10-09 20:47:13.490035	2025-10-09 20:47:13.490035	\N	f	155.00
222	107	140.00	card	1	\N	2025-10-12 18:50:02.771265	2025-10-12 18:50:02.771265	\N	f	140.00
223	107	120.00	card	2	\N	2025-10-12 18:50:02.771265	2025-10-12 18:50:02.771265	\N	f	120.00
224	107	155.00	cash	3	\N	2025-10-12 18:50:02.771265	2025-10-12 18:50:02.771265	\N	f	155.00
225	107	140.00	card	4	\N	2025-10-12 18:50:02.771265	2025-10-12 18:50:02.771265	\N	f	140.00
226	110	80.00	cash	1	\N	2025-10-14 18:42:54.378794	2025-10-14 18:42:54.378794	7	f	80.00
235	137	70.00	blik	1	\N	2025-10-23 13:36:34.09941	2025-10-23 13:36:34.09941	6	f	70.00
236	113	50.00	cash	1	\N	2025-10-23 13:37:15.229498	2025-10-23 13:37:15.229498	4	f	50.00
237	113	80.00	cash	2	\N	2025-10-23 13:37:15.229498	2025-10-23 13:37:15.229498	4	f	80.00
239	141	80.00	cash	1	\N	2025-10-23 22:25:43.307048	2025-10-23 22:25:43.307048	7	f	80.00
242	97	50.00	cash	1	\N	2025-10-23 22:30:40.585051	2025-10-23 22:30:40.585051	3	f	50.00
243	97	80.00	cash	2	\N	2025-10-23 22:30:40.585051	2025-10-23 22:30:40.585051	6	t	80.00
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, user_id, full_name, phone, email, notes, last_visit_date, total_visits, total_spent, created_at, updated_at, company_id) FROM stdin;
1	1	Sylwia Świętnicka	\N	\N	\N	2025-09-27	1	145.00	2025-09-30 10:03:27.39557	2025-09-30 10:03:27.405444	1
16	1	Oliwia Sroka	\N	\N	\N	2026-01-13	3	300.00	2026-01-13 19:31:47.560406	2026-01-22 18:37:11.921463	3
6	1	Klaudia Farej	\N	\N	\N	2026-01-23	8	600.00	2025-10-01 21:53:44.976675	2026-01-24 22:04:04.492746	3
17	1	Natalia Janas	535305051	\N	\N	\N	0	0.00	2026-01-25 10:26:36.917314	2026-01-25 10:31:00.624191	3
14	1	Teściowa Kasi Frydrych	\N	\N	\N	2026-01-22	2	160.00	2026-01-01 15:04:50.374291	2026-01-25 10:31:08.72223	3
13	1	YO Paula	\N	\N	\N	2025-11-27	2	100.00	2025-12-01 14:33:48.456516	2025-12-01 14:33:58.424411	3
7	1	Pani od Psa	\N	\N	\N	2025-12-02	4	350.00	2025-10-14 18:42:54.402534	2025-12-02 12:41:39.95645	3
2	1	Justyna Bajer	\N	\N	\N	2025-12-15	3	240.00	2025-10-01 21:46:44.452155	2025-12-15 19:54:54.787721	3
5	1	Daria Skawinska	\N	\N	\N	2025-12-17	3	210.00	2025-10-01 21:51:26.697464	2025-12-17 10:17:37.72234	3
4	1	Beata Tomkiewicz	\N	\N	\N	2025-12-18	7	520.00	2025-10-01 21:50:29.770786	2025-12-18 20:49:46.72151	3
10	1	Karolina Płonowska	\N	\N	\N	2026-01-09	5	400.00	2025-11-20 18:24:48.427697	2026-01-09 15:19:02.103629	3
15	1	Anna Sroka	\N	\N	\N	2026-01-09	1	100.00	2026-01-09 15:19:02.107631	2026-01-09 15:19:02.114738	3
3	1	Katarzyna Frydrych	\N	\N	\N	2026-01-12	9	540.00	2025-10-01 21:48:52.544546	2026-01-13 19:33:12.286473	3
9	1	Monika Prajsnar	\N	\N	\N	2026-01-10	4	480.00	2025-11-14 19:39:32.206516	2026-01-22 18:35:15.205698	3
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, name, description, address, phone, email, website, created_at, updated_at) FROM stdin;
1	Studio Estetic	Salon kosmetyczny	\N	\N	\N	\N	2025-09-29 19:53:08.094841	2025-09-29 19:53:08.094841
2	Studio Estetic	Salon kosmetyczny	\N	\N	\N	\N	2025-09-29 19:58:23.209322	2025-09-29 19:58:23.209322
3	Dom - Lotników				paulinaw1121@gmail.com	https://brak.pl	2025-09-30 16:54:31.858961	2025-09-30 16:54:31.858961
\.


--
-- Data for Name: company_invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_invitations (id, company_id, inviter_id, invited_email, invited_user_id, role, invitation_token, expires_at, accepted_at, declined_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: daily_earnings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_earnings (id, user_id, date, cash_amount, card_amount, tips_amount, clients_count, hours_worked, notes, entry_mode, created_at, updated_at, company_id) FROM stdin;
3	1	2025-08-06	480.00	235.00	0.00	5	8.00		detailed	2025-09-11 12:16:12.053628	2025-09-29 19:58:23.211724	1
152	1	2025-11-29	0.00	0.00	0.00	0	0.00		detailed	2025-11-29 19:59:36.172084	2025-12-01 14:33:11.736564	3
121	1	2025-10-22	0.00	0.00	0.00	0	0.00		detailed	2025-10-23 11:50:32.251747	2025-10-23 12:08:00.763094	3
4	1	2025-08-07	160.00	550.00	0.00	5	8.50		detailed	2025-09-11 12:17:09.510715	2025-09-29 19:58:23.211724	1
5	1	2025-08-09	0.00	355.00	0.00	2	6.50		detailed	2025-09-11 12:19:54.185154	2025-09-29 19:58:23.211724	1
9	1	2025-08-11	255.00	445.00	0.00	6	8.50		detailed	2025-09-11 19:31:12.686958	2025-09-29 19:58:23.211724	1
154	1	2025-11-27	50.00	0.00	0.00	2	0.00		detailed	2025-12-01 14:30:55.425523	2025-12-01 14:33:58.405869	3
93	1	2025-10-01	126.00	160.00	0.00	2	4.00		detailed	2025-10-01 16:12:04.387208	2025-10-01 17:44:10.02458	1
95	1	2025-09-23	80.00	0.00	0.00	1	0.00		detailed	2025-10-01 21:46:44.42664	2025-10-01 21:46:44.42664	3
96	1	2025-09-16	80.00	0.00	0.00	1	0.00		detailed	2025-10-01 21:48:52.52022	2025-10-01 21:48:52.52022	3
43	1	2025-09-27	227.50	22.50	0.00	4	5.00		detailed	2025-09-27 07:51:24.738777	2025-09-30 10:03:27.363783	1
10	1	2025-08-13	347.20	145.80	0.00	4	6.00		detailed	2025-09-11 19:32:21.74757	2025-09-29 19:58:23.211724	1
62	1	2025-09-30	50.00	0.00	0.00	1	0.00		detailed	2025-09-30 10:02:57.834924	2025-10-01 21:51:26.671758	3
158	1	2025-11-28	0.00	0.00	0.00	1	0.00		detailed	2025-12-01 14:36:29.406559	2025-12-01 14:36:29.406559	3
159	1	2025-12-02	110.00	0.00	0.00	1	0.00		detailed	2025-12-02 12:41:39.926175	2025-12-02 12:41:39.926175	3
11	1	2025-08-14	452.00	509.00	0.00	6	9.50		detailed	2025-09-11 19:33:23.050641	2025-09-29 19:58:23.211724	1
12	1	2025-08-16	80.00	520.00	0.00	3	6.00		detailed	2025-09-11 19:33:47.410456	2025-09-29 19:58:23.211724	1
13	1	2025-08-18	592.00	253.00	0.00	7	8.50		detailed	2025-09-11 19:34:29.115163	2025-09-29 19:58:23.211724	1
103	1	2025-10-04	0.00	160.00	0.00	1	2.00		detailed	2025-10-04 09:09:09.192971	2025-10-04 09:09:19.212212	1
102	1	2025-10-02	60.00	364.00	0.00	4	7.00		detailed	2025-10-04 09:08:42.813017	2025-10-04 09:10:01.409727	1
14	1	2025-08-20	235.00	550.00	0.00	6	7.50		detailed	2025-09-11 19:35:08.126578	2025-09-29 19:58:23.211724	1
15	1	2025-08-21	599.00	96.00	0.00	7	8.50		detailed	2025-09-11 19:35:58.839662	2025-09-29 19:58:23.211724	1
16	1	2025-08-23	40.00	430.00	0.00	4	5.50		detailed	2025-09-11 19:36:21.093897	2025-09-29 19:58:23.211724	1
106	1	2025-10-06	0.00	225.00	0.00	1	3.00		detailed	2025-10-09 08:50:47.015751	2025-10-09 08:50:47.015751	1
17	1	2025-08-25	338.50	236.50	0.00	4	8.00		detailed	2025-09-11 19:36:52.160139	2025-09-29 19:58:23.211724	1
18	1	2025-08-27	476.00	229.00	0.00	4	8.00		detailed	2025-09-11 19:37:17.757981	2025-09-29 19:58:23.211724	1
19	1	2025-08-30	161.00	414.00	0.00	5	7.00		detailed	2025-09-11 19:38:01.78326	2025-09-29 19:58:23.211724	1
35	1	2025-09-24	0.00	155.00	0.00	1	3.00		detailed	2025-09-24 22:18:26.415001	2025-10-09 20:47:13.490035	1
20	1	2025-09-01	170.00	519.00	0.00	5	9.00		detailed	2025-09-11 19:40:27.376684	2025-09-29 19:58:23.211724	1
21	1	2025-09-03	306.00	104.00	0.00	5	4.00		detailed	2025-09-11 19:41:21.794747	2025-09-29 19:58:23.211724	1
22	1	2025-09-04	90.00	573.00	0.00	5	9.00		detailed	2025-09-11 19:42:07.887792	2025-09-29 19:58:23.211724	1
23	1	2025-09-06	0.00	580.00	0.00	5	6.50		detailed	2025-09-11 19:42:53.249718	2025-09-29 19:58:23.211724	1
24	1	2025-09-08	0.00	390.00	0.00	5	6.00		detailed	2025-09-11 19:43:33.73314	2025-09-29 19:58:23.211724	1
25	1	2025-09-10	140.00	540.00	0.00	5	7.50		detailed	2025-09-11 19:44:14.295426	2025-09-29 19:58:23.211724	1
1	1	2025-09-11	0.00	285.00	0.00	2	6.50		detailed	2025-09-11 11:52:28.921061	2025-09-29 19:58:23.211724	1
28	1	2025-09-17	245.00	307.00	0.00	6	6.00		detailed	2025-09-18 20:34:03.278182	2025-09-29 19:58:23.211724	1
27	1	2025-09-13	0.00	485.00	0.00	3	6.00		detailed	2025-09-14 17:18:25.936189	2025-09-29 19:58:23.211724	1
32	1	2025-09-20	0.00	459.00	0.00	3	5.50		detailed	2025-09-20 09:17:01.342282	2025-09-29 19:58:23.211724	1
34	1	2025-09-22	0.00	165.00	0.00	1	2.00		detailed	2025-09-22 09:12:37.758853	2025-09-29 19:58:23.211724	1
160	1	2025-12-11	80.00	0.00	0.00	1	0.00		detailed	2025-12-11 20:33:51.808896	2025-12-11 20:33:51.808896	3
36	1	2025-09-25	305.00	485.00	0.00	4	9.00		detailed	2025-09-25 10:27:39.299841	2025-09-29 19:58:23.211724	1
40	1	2025-09-26	60.00	280.00	0.00	2	4.50		detailed	2025-09-26 09:57:29.217634	2025-09-29 19:58:23.211724	1
107	1	2025-10-09	155.00	400.00	0.00	4	9.00		detailed	2025-10-09 08:51:23.303498	2025-10-12 18:50:02.771265	1
29	1	2025-09-15	202.50	172.50	0.00	3	8.00		detailed	2025-09-18 20:34:48.375202	2025-09-29 19:58:23.211724	1
45	1	2025-09-29	150.00	0.00	0.00	1	1.50		detailed	2025-09-29 18:35:23.602949	2025-09-29 19:58:23.211724	1
110	1	2025-10-14	80.00	0.00	0.00	1	0.00		detailed	2025-10-14 18:42:54.378794	2025-10-14 18:42:54.378794	3
161	1	2025-12-15	80.00	0.00	0.00	1	0.00		detailed	2025-12-15 19:54:54.754207	2025-12-15 19:54:54.754207	3
162	1	2025-12-16	0.00	0.00	0.00	1	0.00		detailed	2025-12-16 20:12:48.237664	2025-12-16 20:13:08.777076	3
115	1	2025-10-23	0.00	0.00	0.00	0	0.00		detailed	2025-10-23 11:43:51.804216	2025-10-23 12:08:31.690057	3
137	1	2025-10-17	0.00	0.00	0.00	1	0.00		detailed	2025-10-23 13:36:34.09941	2025-10-23 13:36:34.09941	3
113	1	2025-10-15	130.00	0.00	0.00	2	0.00		detailed	2025-10-15 21:38:23.942853	2025-10-23 13:37:15.229498	3
139	1	2025-10-12	0.00	0.00	0.00	0	0.00		detailed	2025-10-23 13:37:57.619055	2025-10-23 22:25:23.841197	3
141	1	2025-08-29	80.00	0.00	0.00	1	0.00		detailed	2025-10-23 22:25:43.307048	2025-10-23 22:25:43.307048	3
164	1	2025-12-17	80.00	0.00	0.00	1	0.00		detailed	2025-12-17 10:17:37.694722	2025-12-17 10:17:37.694722	3
97	1	2025-09-18	100.00	0.00	0.00	2	0.00		detailed	2025-10-01 21:49:10.108779	2025-10-23 22:30:40.585051	3
144	1	2025-11-05	80.00	0.00	0.00	1	0.00		detailed	2025-11-05 20:50:35.642322	2025-11-05 20:50:35.642322	3
145	1	2025-11-06	80.00	0.00	0.00	1	0.00		detailed	2025-11-13 19:41:57.645545	2025-11-13 19:41:57.645545	3
146	1	2025-11-07	0.00	0.00	0.00	1	0.00		detailed	2025-11-13 19:42:15.959191	2025-11-13 19:42:15.959191	3
147	1	2025-11-14	0.00	0.00	0.00	1	0.00		detailed	2025-11-14 19:39:32.206516	2025-11-14 19:39:32.206516	3
148	1	2025-11-18	160.00	0.00	0.00	2	0.00		detailed	2025-11-20 18:24:14.266852	2025-11-20 18:24:14.266852	3
149	1	2025-11-20	0.00	0.00	0.00	1	0.00		detailed	2025-11-20 18:24:48.427697	2025-11-20 18:24:48.427697	3
150	1	2025-11-25	80.00	0.00	0.00	1	0.00		detailed	2025-11-26 20:50:07.897116	2025-11-26 20:50:07.897116	3
151	1	2025-11-26	50.00	0.00	0.00	1	0.00		detailed	2025-11-26 20:50:47.174884	2025-11-26 20:50:47.174884	3
168	1	2026-01-09	180.00	0.00	0.00	2	0.00		detailed	2026-01-09 11:12:33.896617	2026-01-09 15:19:02.073561	3
165	1	2025-12-18	100.00	0.00	0.00	1	0.00		detailed	2025-12-18 20:49:46.687086	2025-12-18 20:49:46.687086	3
166	1	2025-12-19	0.00	0.00	0.00	1	0.00		detailed	2025-12-21 22:59:54.601592	2025-12-21 22:59:54.601592	3
167	1	2025-12-30	80.00	0.00	0.00	1	0.00		detailed	2026-01-01 15:04:50.339749	2026-01-01 15:04:50.339749	3
172	1	2026-01-12	0.00	0.00	0.00	1	0.00		detailed	2026-01-13 19:33:12.24631	2026-01-13 19:33:12.24631	3
173	1	2026-01-22	80.00	0.00	0.00	1	0.00		detailed	2026-01-22 18:33:41.257248	2026-01-22 18:33:41.257248	3
170	1	2026-01-10	150.00	0.00	0.00	1	0.00		detailed	2026-01-10 11:53:20.861322	2026-01-22 18:35:15.169533	3
179	1	2026-01-23	0.00	0.00	0.00	1	0.00		detailed	2026-01-24 22:04:04.46376	2026-01-24 22:04:04.46376	3
175	1	2026-01-14	0.00	0.00	0.00	0	0.00		detailed	2026-01-22 18:35:48.870836	2026-01-22 18:36:46.367002	3
171	1	2026-01-13	100.00	0.00	0.00	1	0.00		detailed	2026-01-13 19:31:47.536972	2026-01-22 18:37:11.885697	3
\.


--
-- Data for Name: user_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_companies (id, user_id, company_id, role, is_active, joined_at, created_at, updated_at) FROM stdin;
1	1	1	owner	t	2025-09-29 19:53:08.096774	2025-09-29 19:53:08.096774	2025-09-29 19:58:23.211724
3	1	3	owner	t	2025-09-30 16:54:31.858961	2025-09-30 16:54:31.858961	2025-09-30 16:54:31.858961
\.


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_settings (id, user_id, hourly_rate, created_at, updated_at, company_id) FROM stdin;
1	1	30.50	2025-09-11 11:52:23.832765	2025-09-29 19:58:23.211724	1
2	1	0.00	2025-09-30 17:10:05.153055	2025-09-30 17:10:05.153055	3
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, first_name, last_name, created_at, updated_at, current_company_id, last_company_switch) FROM stdin;
2	testerkont@gmail.com	$2a$10$mbRZ8hx2nbFn/Ws/7RN9Suu98tZBT0QhDJlURmijzNIRd9IElRQ22	Tester	Kont	2025-09-29 21:03:35.771937	2025-09-29 21:03:35.771937	\N	\N
1	paulinaw1121@gmail.com	$2a$10$7g.XPpiGU9ENrZ9aWw3EOefGScjRwMMSfO5wljglYGH73uzlYLaTu	Paulina	Wilczyńska	2025-09-11 11:52:23.690277	2025-12-22 12:14:37.503155	3	2025-12-22 12:14:37.503155
\.


--
-- Name: client_payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_payment_methods_id_seq', 114, true);


--
-- Name: client_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_transactions_id_seq', 281, true);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_id_seq', 17, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.companies_id_seq', 3, true);


--
-- Name: company_invitations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_invitations_id_seq', 1, false);


--
-- Name: daily_earnings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_earnings_id_seq', 179, true);


--
-- Name: user_companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_companies_id_seq', 3, true);


--
-- Name: user_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_settings_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: client_payment_methods client_payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_payment_methods
    ADD CONSTRAINT client_payment_methods_pkey PRIMARY KEY (id);


--
-- Name: client_transactions client_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_transactions
    ADD CONSTRAINT client_transactions_pkey PRIMARY KEY (id);


--
-- Name: clients clients_company_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_company_name_unique UNIQUE (company_id, full_name);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_invitations company_invitations_invitation_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_invitations
    ADD CONSTRAINT company_invitations_invitation_token_key UNIQUE (invitation_token);


--
-- Name: company_invitations company_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_invitations
    ADD CONSTRAINT company_invitations_pkey PRIMARY KEY (id);


--
-- Name: daily_earnings daily_earnings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_earnings
    ADD CONSTRAINT daily_earnings_pkey PRIMARY KEY (id);


--
-- Name: daily_earnings daily_earnings_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_earnings
    ADD CONSTRAINT daily_earnings_user_id_date_key UNIQUE (user_id, date);


--
-- Name: user_companies user_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT user_companies_pkey PRIMARY KEY (id);


--
-- Name: user_companies user_companies_user_id_company_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT user_companies_user_id_company_id_key UNIQUE (user_id, company_id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_user_company_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_company_unique UNIQUE (user_id, company_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_client_payment_methods_method; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_payment_methods_method ON public.client_payment_methods USING btree (payment_method);


--
-- Name: idx_client_payment_methods_transaction; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_payment_methods_transaction ON public.client_payment_methods USING btree (client_transaction_id);


--
-- Name: idx_client_transactions_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_transactions_client_id ON public.client_transactions USING btree (client_id);


--
-- Name: idx_client_transactions_daily_earnings; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_transactions_daily_earnings ON public.client_transactions USING btree (daily_earnings_id);


--
-- Name: idx_client_transactions_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_transactions_order ON public.client_transactions USING btree (daily_earnings_id, client_order);


--
-- Name: idx_clients_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_company ON public.clients USING btree (company_id, full_name);


--
-- Name: idx_clients_last_visit; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_last_visit ON public.clients USING btree (user_id, last_visit_date DESC);


--
-- Name: idx_clients_name_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_name_search ON public.clients USING btree (user_id, full_name);


--
-- Name: idx_clients_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_phone ON public.clients USING btree (user_id, phone);


--
-- Name: idx_clients_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_user_id ON public.clients USING btree (user_id);


--
-- Name: idx_company_invitations_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_invitations_email ON public.company_invitations USING btree (invited_email);


--
-- Name: idx_company_invitations_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_invitations_token ON public.company_invitations USING btree (invitation_token);


--
-- Name: idx_company_invitations_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_company_invitations_user ON public.company_invitations USING btree (invited_user_id);


--
-- Name: idx_daily_earnings_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_daily_earnings_company ON public.daily_earnings USING btree (company_id, date);


--
-- Name: idx_daily_earnings_user_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_daily_earnings_user_date ON public.daily_earnings USING btree (user_id, date);


--
-- Name: idx_daily_earnings_user_month; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_daily_earnings_user_month ON public.daily_earnings USING btree (user_id, EXTRACT(year FROM date), EXTRACT(month FROM date));


--
-- Name: idx_user_companies_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_companies_active ON public.user_companies USING btree (user_id, is_active);


--
-- Name: idx_user_companies_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_companies_company_id ON public.user_companies USING btree (company_id);


--
-- Name: idx_user_companies_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_companies_user_id ON public.user_companies USING btree (user_id);


--
-- Name: idx_user_settings_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_settings_company ON public.user_settings USING btree (company_id);


--
-- Name: idx_users_current_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_current_company ON public.users USING btree (current_company_id);


--
-- Name: client_payment_methods update_client_payment_methods_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_client_payment_methods_updated_at BEFORE UPDATE ON public.client_payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: client_transactions update_client_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_client_transactions_updated_at BEFORE UPDATE ON public.client_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: clients update_clients_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: companies update_companies_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: company_invitations update_company_invitations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_company_invitations_updated_at BEFORE UPDATE ON public.company_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: daily_earnings update_daily_earnings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_daily_earnings_updated_at BEFORE UPDATE ON public.daily_earnings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_companies update_user_companies_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_companies_updated_at BEFORE UPDATE ON public.user_companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_settings update_user_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: client_payment_methods client_payment_methods_client_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_payment_methods
    ADD CONSTRAINT client_payment_methods_client_transaction_id_fkey FOREIGN KEY (client_transaction_id) REFERENCES public.client_transactions(id) ON DELETE CASCADE;


--
-- Name: client_transactions client_transactions_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_transactions
    ADD CONSTRAINT client_transactions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: client_transactions client_transactions_daily_earnings_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_transactions
    ADD CONSTRAINT client_transactions_daily_earnings_id_fkey FOREIGN KEY (daily_earnings_id) REFERENCES public.daily_earnings(id) ON DELETE CASCADE;


--
-- Name: clients clients_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: clients clients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: company_invitations company_invitations_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_invitations
    ADD CONSTRAINT company_invitations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_invitations company_invitations_invited_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_invitations
    ADD CONSTRAINT company_invitations_invited_user_id_fkey FOREIGN KEY (invited_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: company_invitations company_invitations_inviter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_invitations
    ADD CONSTRAINT company_invitations_inviter_id_fkey FOREIGN KEY (inviter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: daily_earnings daily_earnings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_earnings
    ADD CONSTRAINT daily_earnings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: daily_earnings daily_earnings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_earnings
    ADD CONSTRAINT daily_earnings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_companies user_companies_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT user_companies_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: user_companies user_companies_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT user_companies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_settings user_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_current_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_current_company_id_fkey FOREIGN KEY (current_company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: TABLE clients_with_recent_activity; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.clients_with_recent_activity TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict UnbwCdGKgFlk0t0NYIkdwOma8kRlb0kyoKNcFp2yi6EBBYalZ6Aa2KrehpTMKSS

