import Page from '@/components/page';

const Default = ({ children }) => <Page>{children}</Page>;

export const getLayout = (page) => <Default>{page}</Default>;

export default Default;
