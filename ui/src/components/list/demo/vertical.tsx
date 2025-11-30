import type React from "react";
import { Icon } from "@acme/ui/icons";
import { Avatar } from "@acme/ui/components/avatar";
import { List } from "@acme/ui/components/list";
import { Space } from "@acme/ui/components/space";

const data = Array.from({ length: 23 }).map((_, i) => ({
  href: "https://ant.design",
  title: `ant design part ${i}`,
  avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`,
  description:
    "Ant Design, a design language for background applications, is refined by Ant UED Team.",
  content:
    "We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.",
}));

const IconText = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <Space>
    {icon}
    {text}
  </Space>
);

const App: React.FC = () => (
  <List
    itemLayout="vertical"
    size="large"
    pagination={{
      onChange: (page) => {
        console.log(page);
      },
      pageSize: 3,
    }}
    dataSource={data}
    footer={
      <div>
        <b>ant design</b> footer part
      </div>
    }
    renderItem={(item) => (
      <List.Item
        key={item.title}
        actions={[
          <IconText
            icon={<Icon icon="icon-[lucide--star]" />}
            text="156"
            key="list-vertical-star-o"
          />,
          <IconText
            icon={<Icon icon="icon-[lucide--heart]" />}
            text="156"
            key="list-vertical-like-o"
          />,
          <IconText
            icon={<Icon icon="icon-[lucide--message-circle]" />}
            text="2"
            key="list-vertical-message"
          />,
        ]}
        extra={
          <img
            draggable={false}
            width={272}
            alt="logo"
            src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
          />
        }
      >
        <List.Item.Meta
          avatar={<Avatar src={item.avatar} />}
          title={<a href={item.href}>{item.title}</a>}
          description={item.description}
        />
        {item.content}
      </List.Item>
    )}
  />
);

export default App;
